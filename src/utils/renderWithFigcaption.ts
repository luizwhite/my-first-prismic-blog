import { RichTextBlock } from 'prismic-reactjs';

export const renderWithFigcaption = (body: RichTextBlock[]): RichTextBlock[] =>
  body
    .map((elem, i) => {
      if (elem?.oembed?.provider_name === 'static_image')
        return {
          ...elem,
          oembed: {
            ...elem.oembed,
            html: `
              <figure data-type="static_image">
                <img src="${elem.oembed.url}">
                <figcaption>${
                  body[i + 1]?.spans[0]?.data?.label === 'figcaption'
                    ? body[i + 1].text
                    : ''
                }</figcaption>
              </figure>
            `,
          },
        };

      if (elem.type === 'embed' && elem?.oembed?.type === 'video')
        return {
          ...elem,
          oembed: {
            ...elem.oembed,
            html: `${elem.oembed.html}
              <figcaption>${
                body[i + 1]?.spans[0]?.data?.label === 'figcaption'
                  ? body[i + 1].text
                  : ''
              }</figcaption>
            `,
          },
        };

      return elem;
    })
    .filter((elem) =>
      elem?.spans?.length ? elem.spans[0]?.data?.label !== 'figcaption' : true,
    );
