import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { Document as PrismicDocument } from '@prismicio/client/types/documents';
import { RichText, RichTextBlock } from 'prismic-reactjs';
import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';

import { useMemo } from 'react';
import { getPrismicClient } from '../../services/prismic';
import Header from '../../components/Header';
import { UtterancesComments } from '../../components/UterrancesComments';
import { parseDate } from '../../utils/parseDate';
import { renderWithFigcaption } from '../../utils/renderWithFigcaption';

// import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { getDateTime } from '../../utils/getDateTime';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    editedDateTime: string;
    content: {
      heading: string;
      // body: {
      //   text: string;
      // }[];
      body: RichTextBlock[];
    }[];
  };
}

interface PostProps {
  post: Post;
  preview: boolean;
  postNavigation: {
    previousDocument: PrismicDocument | null;
    nextDocument: PrismicDocument | null;
  };
}

const Post = ({ post, preview, postNavigation }: PostProps): JSX.Element => {
  const router = useRouter();

  const date = useMemo(() => parseDate(new Date(post.first_publication_date)), [
    post.first_publication_date,
  ]);

  const wordsQuantity = useMemo(
    () =>
      post.data.content.reduce(
        (acc, { heading, body }) =>
          acc +
          heading.split(' ').length +
          RichText.asText(body).split(' ').length,
        0,
      ) + post.data.title.split(' ').length,
    [post.data.content, post.data.title],
  );

  const readingTime = useMemo(() => Math.ceil(wordsQuantity / 200), [
    wordsQuantity,
  ]);

  return (
    <>
      <Header />
      <div
        style={{ backgroundImage: `url(${post.data.banner.url})` }}
        className={styles.banner}
      />
      <main className={styles.contentContainer}>
        {!router.isFallback ? (
          <>
            <h1>{post.data.title}</h1>
            <div className={styles.infoContainer}>
              <div>
                <FiCalendar size={20} />
                <time>{date}</time>
              </div>
              <div>
                <FiUser size={20} />
                <span>{post.data.author}</span>
              </div>
              <div>
                <FiClock size={20} />
                <span>{`${readingTime} min`}</span>
              </div>
            </div>
            <span className={styles.editedDateTime}>
              {`editado em ${post.data.editedDateTime}`}
            </span>
            {post.data.content.length &&
              post.data.content.map(({ heading, body }) => (
                <div key={heading}>
                  <h2>{heading}</h2>
                  <RichText render={renderWithFigcaption(body)} />
                </div>
              ))}
          </>
        ) : (
          <div>Carregando...</div>
        )}
        <footer>
          <div className={styles.postNavigationContainer}>
            {postNavigation.previousDocument && (
              <div>
                <span>
                  {RichText.asText(postNavigation.previousDocument.data.title)}
                </span>
                <Link href={`/post/${postNavigation.previousDocument.uid}`}>
                  <a>Post anterior</a>
                </Link>
              </div>
            )}
            {postNavigation.nextDocument && (
              <div className={styles.nextDocument}>
                <span>
                  {RichText.asText(postNavigation.nextDocument.data.title)}
                </span>
                <Link href={`/post/${postNavigation.nextDocument.uid}`}>
                  <a>Próximo Post</a>
                </Link>
              </div>
            )}
          </div>
          <UtterancesComments />
          {preview && (
            <Link href="/api/exit-preview">
              <a>Sair do modo preview</a>
            </Link>
          )}
        </footer>
      </main>
    </>
  );
};

export default Post;

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  const prismic = getPrismicClient();
  const { results } = await prismic.query(
    [Prismic.Predicates.at('document.type', 'post')],
    {
      fetch: ['post.title'],
      orderings: '[document.first_publication_date]',
    },
  );

  return {
    paths: results.map(({ uid }) => ({
      params: {
        slug: uid,
      },
    })), // quais gerar durante a build
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<PostProps> = async ({
  params,
  preview = false,
  previewData = {},
}) => {
  const { slug } = params;
  const { ref } = previewData;

  const prismic = getPrismicClient();
  const document = await prismic.getByUID(
    'post',
    String(slug),
    ref ? { ref } : {},
  );

  const { results: nextDocumentResult } = await prismic.query(
    Prismic.Predicates.dateAfter(
      'document.last_publication_date',
      document.last_publication_date || 2000,
    ),
    {
      fetch: 'post.title',
      pageSize: 1,
      orderings: '[document.last_publication_date]',
    },
  );
  const [nextDocument] = nextDocumentResult;

  const { results: previousDocumentResult } = await prismic.query(
    Prismic.Predicates.dateBefore(
      'document.last_publication_date',
      document.last_publication_date || 2100,
    ),
    {
      fetch: 'post.title',
      pageSize: 1,
      orderings: '[document.last_publication_date desc]',
    },
  );
  const [previousDocument] = previousDocumentResult;

  const { title, subtitle, author, banner, content } = document.data;
  const post = {
    first_publication_date: document.first_publication_date,
    uid: document.uid,
    data:
      typeof title !== 'string'
        ? {
            title: RichText.asText(title),
            subtitle: RichText.asText(subtitle),
            banner,
            author: RichText.asText(author),
            editedDateTime: getDateTime(
              new Date(document.last_publication_date),
            ),
            content: content.map(
              ({
                heading,
                body,
              }: {
                heading: RichTextBlock[];
                body: RichTextBlock[];
              }) => ({
                heading: RichText.asText(heading),
                body,
              }),
            ),
          }
        : {
            title,
            subtitle,
            banner,
            author,
            editedDateTime: '',
            content: content.map(
              ({
                heading,
                body,
              }: {
                heading: RichTextBlock[];
                body: RichTextBlock[];
              }) => ({
                heading,
                body,
              }),
            ),
          },
  };

  return {
    props: {
      post,
      preview,
      postNavigation: {
        previousDocument: previousDocument || null,
        nextDocument: nextDocument || null,
      },
    },
  };
};
