import { FolderKanban } from 'lucide-react';

export default function TareasProyectosTab() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
      <FolderKanban className="w-12 h-12 mb-4 opacity-30" />
      <h3 className="text-lg font-medium">Tareas & Proyectos</h3>
      <p className="text-sm mt-1">Disponible próximamente</p>
    </div>
  );
}
