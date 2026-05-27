import { API_BASE, headers } from "@/utils/constants";
import { Lider } from "@/types/Lider";

const caminho = "Lideres";
const elemento_singular = "líder";
const elemento_plural = "líderes";

export async function getAll(): Promise<Lider[]> {
    const res = await fetch(`${API_BASE}/api/${caminho}`, {
        headers: headers(),
    });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Erro ${res.status} ao buscar ${elemento_plural}: ${msg}`);
    }
    return res.json();
}

export async function getElementById(id: number): Promise<Lider> {
    const res = await fetch(`${API_BASE}/api/${caminho}/${id}`, { headers: headers() });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Erro ${res.status} ao buscar ${elemento_singular}: ${msg}`);
    }
    return res.json();
}

export async function createElement(data: Lider): Promise<void> {
    const res = await fetch(`${API_BASE}/api/${caminho}`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Erro ${res.status} ao criar ${elemento_singular}: ${msg}`);
    }
}

export async function updateElement(data: Lider): Promise<void> {
    const res = await fetch(`${API_BASE}/api/${caminho}/${data.sequencial}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Erro ${res.status} ao atualizar ${elemento_singular}: ${msg}`);
    }
}

export async function deleteElement(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/api/${caminho}/${id}`, {
        method: "DELETE",
        headers: headers(),
    });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Erro ${res.status} ao excluir ${elemento_singular}: ${msg}`);
    }
}

export async function getFuncionariosAtivos(): Promise<{ nim: string; name: string; internal_number: string }[]> {
    const res = await fetch(`${API_BASE}/api/${caminho}/funcionarios-ativos`, {
        headers: headers(),
    });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Erro ${res.status} ao buscar funcionários: ${msg}`);
    }
    return res.json();
}

export type { Lider };
