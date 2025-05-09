import SearchProperties from "@/components/SearchProperties";
import TextImageSection from "@/components/TextImageSection";

export default function Home() {
  return (
    <>
      <SearchProperties />
      <TextImageSection
        title="Nosotros"
        mainParagraph="Este es el párrafo principal que aparece debajo del título."
        subtitle="dzts inmobiliaria"
        paragraphs={[
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
          "Más texto de ejemplo para la sección."
        ]}
        image="/Images/backgroun.jpg"
      />
    </>
  );
}
