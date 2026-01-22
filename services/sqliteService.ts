
// Este serviço foi movido para o Backend (server.js).
// O Frontend agora utiliza axios via services/api.ts para persistir dados centralizadamente.
export const sqliteService = {
    init: () => { console.warn("Motor WASM desativado em favor do Backend central."); return null; },
    persist: () => {}
};
