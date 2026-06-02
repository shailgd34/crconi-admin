import { HelmetProvider, Helmet } from "react-helmet-async";

const PageMeta = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  // Dynamically substitute generic template name with the custom brand name
  const sanitizedTitle = title ? title.replace(/Crconi Digital Admin/g, "Croconi Digital Admin") : title;
  const sanitizedDescription = description ? description.replace(/Crconi Digital Admin/g, "Croconi Digital Admin") : description;

  return (
    <Helmet>
      <title>{sanitizedTitle}</title>
      <meta name="description" content={sanitizedDescription} />
    </Helmet>
  );
};

export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>{children}</HelmetProvider>
);

export default PageMeta;
