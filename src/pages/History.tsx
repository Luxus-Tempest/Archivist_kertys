export function History() {
  return (
    <div className="w-[95%] mx-auto space-y-10">
      <section>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Historique des sessions</h1>
            <p className="text-base text-zinc-500 mt-1">Consultez vos traitements passés et leurs résultats.</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xs p-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mb-4 border border-zinc-100">
             <span className="text-zinc-400 text-xl font-medium">!</span>
          </div>
          <h3 className="text-zinc-900 font-medium mb-1">Aucun historique pour le moment</h3>
          <p className="text-zinc-500 text-sm max-w-xs">
            Vos traitements apparaîtront ici une fois terminés.
          </p>
        </div>
      </section>
    </div>
  );
}
