'use client'

import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
    useTransition
} from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { ColumnDef, Row } from '@tanstack/react-table'
import { SearchIcon, SquarePlus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner';
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form'
import { stripDiacritics } from '@/utils/functions'
import {
    Grupo,
    getAll,
    getElementById,
    createElement,
    updateElement,
    deleteElement
} from '@/services/gruposService'

export default function Page() {
    const titulo = 'Grupos'
    const router = useRouter()
    const searchParams = useSearchParams()
    const [query, setQuery] = useState<string>(searchParams.get('q') ?? '')
    const [results, setResults] = useState<Grupo[]>([])
    const [resultById, setResultById] = useState<Grupo>()
    const [searched, setSearched] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [updateMode, setUpdateMode] = useState(false)
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const debounceRef = useRef<NodeJS.Timeout | null>(null)
    const loading = isPending

    const legendaCampos: Record<string, string> = {
        todos: "Todos",
        lideranca: "Liderança",
        gestaopessoas: "Gestão de Pessoas",
        contabilfinanceiro: "Contábil/Financeiro",
        ti: "TI",
        manutencao: "Manutenção",
        ssmaas: "SSMAAS",
        juridico: "Jurídico",
        comunicacao: "Comunicação",
        ouvidoria: "Ouvidoria",
        cca: "CCA",
        cco: "CCO",
        aph: "APH",
        arrecadacao: "Arrecadação",
        trafego: "Tráfego",
        sinalizacaocondominio: "Sinalização Condomínio",
        gestaolideranca: "Gestão Liderança",
        laboratoriousina: "Laboratório/Usina",
        topografia: "Topografia",
        administrativo: "Administrativo",
        engenhariaobras: "Engenharia/Obras",
    };

    const camposCheckbox: (keyof Grupo)[] = [
        "todos",
        "lideranca",
        "gestaopessoas",
        "contabilfinanceiro",
        "ti",
        "manutencao",
        "ssmaas",
        "juridico",
        "comunicacao",
        "ouvidoria",
        "cca",
        "cco",
        "aph",
        "arrecadacao",
        "trafego",
        "sinalizacaocondominio",
        "gestaolideranca",
        "laboratoriousina",
        "topografia",
        "administrativo",
        "engenhariaobras",
    ];

    const form = useForm<Grupo>({
        defaultValues: {
            id: 0,
            idcargo: '',
            todos: 0,
            lideranca: 0,
            gestaopessoas: 0,
            contabilfinanceiro: 0,
            ti: 0,
            manutencao: 0,
            ssmaas: 0,
            juridico: 0,
            comunicacao: 0,
            ouvidoria: 0,
            cca: 0,
            cco: 0,
            aph: 0,
            arrecadacao: 0,
            trafego: 0,
            sinalizacaocondominio: 0,
            gestaolideranca: 0,
            laboratoriousina: 0,
            topografia: 0,
            administrativo: 0,
            engenhariaobras: 0,
        },
    })

    function clearQuery() { setQuery('') }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSearchClick()
        }
    }

    useEffect(() => {
        handleSearch(searchParams.get('q') ?? '')
    }, [])

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            startTransition(() => {
                const sp = new URLSearchParams(Array.from(searchParams.entries()))
                if (query) sp.set('q', query)
                else sp.delete('q')
                router.replace(`?${sp.toString()}`)
            })
            handleSearch(query)
        }, 300)
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [query])

    async function handleSearch(q: string) {
        setError(null)
        try {
            const dados = await getAll()
            const qNorm = stripDiacritics(q.toLowerCase().trim())
            const filtrados = qNorm
                ? dados.filter(
                    p =>
                        stripDiacritics((p.idcargo ?? '').toLowerCase()).includes(qNorm) ||
                        String(p.id ?? '').includes(qNorm)
                )
                : dados

            setResults(filtrados)
        } catch (err) {
            setError((err as Error).message)
            setResults([])
        } finally {
            setSearched(true)
        }
    }

    async function handleSearchClick() {
        startTransition(() => {
            const sp = new URLSearchParams(Array.from(searchParams.entries()))
            if (query) sp.set('q', query)
            else sp.delete('q')
            router.replace(`?${sp.toString()}`)
        })
        await handleSearch(query)
    }

    async function handleDeleteConfirmed() {
        if (!deleteId) return

        try {
            await deleteElement(deleteId)
        } catch (err) {
            toast.error((err as Error).message)
        } finally {
            toast.success(`Registro excluído`)
            setDeleteId(null)
            await handleSearchClick()
        }
    }

    async function handleUpdate(id: number) {
        setError(null)
        setUpdateMode(true)
        try {
            const response = await getElementById(id)
            setResultById(response)
            form.reset({
                id: response.id ?? 0,
                idcargo: response.idcargo ?? '',
                todos: response.todos ?? 0,
                lideranca: response.lideranca ?? 0,
                gestaopessoas: response.gestaopessoas ?? 0,
                contabilfinanceiro: response.contabilfinanceiro ?? 0,
                ti: response.ti ?? 0,
                manutencao: response.manutencao ?? 0,
                ssmaas: response.ssmaas ?? 0,
                juridico: response.juridico ?? 0,
                comunicacao: response.comunicacao ?? 0,
                ouvidoria: response.ouvidoria ?? 0,
                cca: response.cca ?? 0,
                cco: response.cco ?? 0,
                aph: response.aph ?? 0,
                arrecadacao: response.arrecadacao ?? 0,
                trafego: response.trafego ?? 0,
                sinalizacaocondominio: response.sinalizacaocondominio ?? 0,
                gestaolideranca: response.gestaolideranca ?? 0,
                laboratoriousina: response.laboratoriousina ?? 0,
                topografia: response.topografia ?? 0,
                administrativo: response.administrativo ?? 0,
                engenhariaobras: response.engenhariaobras ?? 0,
            })

            setIsModalOpen(true)
        } catch (err) {
            toast.error(`Erro ao carregar: ${(err as Error).message}`)
        }
    }

    function handleInsert() {
        form.reset({
            id: 0,
            idcargo: '',
            todos: 0,
            lideranca: 0,
            gestaopessoas: 0,
            contabilfinanceiro: 0,
            ti: 0,
            manutencao: 0,
            ssmaas: 0,
            juridico: 0,
            comunicacao: 0,
            ouvidoria: 0,
            cca: 0,
            cco: 0,
            aph: 0,
            arrecadacao: 0,
            trafego: 0,
            sinalizacaocondominio: 0,
            gestaolideranca: 0,
            laboratoriousina: 0,
            topografia: 0,
            administrativo: 0,
            engenhariaobras: 0,
        })
        setUpdateMode(false)
        setIsModalOpen(true)
    }

    async function onSubmit(data: Grupo) {
        setError(null)
        try {
            if (data.id && data.id !== 0) {
                await updateElement(data)
            } else {
                await createElement(data)
            }
        } catch (err) {
            toast.error((err as Error).message)
        } finally {
            toast.success(`Registro enviado`)
            form.reset()
            await handleSearchClick()
            setIsModalOpen(false)
        }
    }

    const colunas = useMemo<ColumnDef<Grupo>[]>(() => [
        { accessorKey: 'id', header: 'ID' },
        { accessorKey: 'idcargo', header: 'CARGO' },
        ...camposCheckbox.map((campo) => ({
            accessorKey: campo,
            header: legendaCampos[campo].toUpperCase() || campo.toUpperCase(),
            cell: ({ row }: { row: Row<Grupo> }) => (
                <div className="flex justify-center items-center">
                    <input
                        type="checkbox"
                        checked={row.original[campo] === 1}
                        readOnly
                        className="cursor-default"
                    />
                </div>
            ),
        })),
        {
            id: 'actions',
            header: 'AÇÕES',
            cell: ({ row }: { row: Row<Grupo> }) => (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdate(row.original.id!)}
                    >
                        Editar
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteId(row.original.id!)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            )
        }
    ], []);

    return (
        <div className="pt-6 pr-6">
            <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl font-bold">{titulo}</CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col gap-2 md:flex-row">
                    <div className="relative flex-1">
                        <Input
                            placeholder="Pesquise por nome ou ID"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="pr-10"
                            aria-label="Campo de busca"
                        />
                        {query && (
                            <button
                                aria-label="Limpar busca"
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted"
                                onClick={clearQuery}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <Button onClick={handleSearchClick} className="flex items-center">
                        <SearchIcon className="mr-1 h-4 w-4" />
                        Buscar
                    </Button>

                    <Button onClick={handleInsert} className="flex items-center">
                        <SquarePlus className="mr-1 h-4 w-4" />
                        Novo
                    </Button>
                </CardContent>
            </Card>

            <Card className="mb-6">
                <CardContent className="flex flex-col">
                    <DataTable columns={colunas} data={results} loading={loading} />
                </CardContent>
            </Card>

            {/* Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md overflow-x-auto overflow-y-auto max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-center">
                            {updateMode
                                ? `Editar cargo: ${resultById?.id}`
                                : 'Novo cargo'}
                        </DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                            <FormField
                                control={form.control}
                                name="idcargo"
                                rules={{ required: 'Cargo é obrigatório' }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>CARGO</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {[
                                'todos',
                                'lideranca',
                                'gestaopessoas',
                                'contabilfinanceiro',
                                'ti',
                                'manutencao',
                                'ssmaas',
                                'juridico',
                                'comunicacao',
                                'ouvidoria',
                                'cca',
                                'cco',
                                'aph',
                                'arrecadacao',
                                'trafego',
                                'sinalizacaocondominio',
                                'gestaolideranca',
                                'laboratoriousina',
                                'topografia',
                                'administrativo',
                                'engenhariaobras',
                            ].map((name) => (
                                <FormField
                                    key={name}
                                    control={form.control}
                                    name={name as keyof Grupo}
                                    render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2">
                                            <FormControl>
                                                <input
                                                    type="checkbox"
                                                    checked={!!field.value}
                                                    onChange={(e) => field.onChange(e.target.checked ? 1 : 0)}
                                                />
                                            </FormControl>
                                            <FormLabel>{legendaCampos[name].toLocaleUpperCase() || name.toLocaleUpperCase()}</FormLabel>
                                        </FormItem>
                                    )}
                                />
                            ))}

                            <Button type="submit" disabled={loading}>
                                {loading ? 'Salvando…' : 'Salvar'}
                            </Button>
                        </form>
                    </Form>

                </DialogContent>
            </Dialog>

            {error && (
                <p className="mb-4 text-center text-sm text-destructive">
                    Erro: {error}
                </p>
            )}

            {!searched && (
                <div className="grid gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
                    ))}
                </div>
            )}

            {searched && results.length === 0 && !loading && !error && (
                <p className="text-center text-sm text-muted-foreground">
                    Nenhum registro encontrado.
                </p>
            )}

            {deleteId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-sm rounded-xl bg-background p-4 shadow-2xl">
                        <h3 className="mb-2 text-base font-semibold">
                            Excluir cargo
                        </h3>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Tem certeza que deseja excluir o registro #{deleteId}?
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setDeleteId(null)}>
                                Cancelar
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteConfirmed}>
                                Excluir
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
