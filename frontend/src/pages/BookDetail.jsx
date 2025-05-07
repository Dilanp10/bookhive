import { useParams } from "react-router-dom";

export default function BookDetail() {
  const { id } = useParams();

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Detalle del Libro: {id}</h2>
    </div>
  );
}