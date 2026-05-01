import { API_BASE, headers } from "@/utils/constants";
import { Grupo } from "@/types/Grupo";
const caminho = "Grupos";
const elemento_singular = "grupo";
const elemento_plural = "grupos";

export async function getAll(): Promise<Grupo[]> {
    const res = await fetch(`${API_BASE}/api/${caminho}`, {
        headers: headers(),
    });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Erro ${res.status} ao buscar ${elemento_plural}: ${msg}`);
    }
    const list: Grupo[] = await res.json();
    return list;
}

export async function getElementById(id: number): Promise<Grupo> {
    const res = await fetch(`${API_BASE}/api/${caminho}/${id}`, { headers: headers(), });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Erro ${res.status} ao buscar ${elemento_singular}: ${msg}`);
    }
    const apiData: Grupo = await res.json();
    return apiData;
}

export async function createElement(data: Grupo): Promise<void> {
    const res = await fetch(`${API_BASE}/api/${caminho}`, { method: "POST", headers: headers(), body: JSON.stringify(data) });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Erro ${res.status} ao criar ${elemento_singular}: ${msg}`);
    }
}
  
export async function updateElement(data: Grupo): Promise<void> {
    const res = await fetch(`${API_BASE}/api/${caminho}/${data.id}`, { method: "PUT", headers: headers(), body: JSON.stringify(data) });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Erro ${res.status} ao atualizar ${elemento_singular}: ${msg}`);
    }
}
  
export async function deleteElement(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/api/${caminho}/${id}`, { method: "DELETE", headers: headers() });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Erro ${res.status} ao atualizar ${elemento_singular}: ${msg}`);
    }
}

export async function getFuncionariosAtivos(): Promise<{ id_person_performance: number | null; name: string }[]> {
    const res = await fetch(`${API_BASE}/api/${caminho}/funcionarios-ativos`, {
        headers: headers(),
    });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Erro ${res.status} ao buscar funcionários: ${msg}`);
    }
    return res.json();
}

export type { Grupo }