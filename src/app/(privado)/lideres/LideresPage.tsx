'use client'

import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
    useTransition
} from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Control, useForm } from 'react-hook-form'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Check, ChevronsUpDown, SearchIcon, SquarePlus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { stripDiacritics } from '@/utils/functions'
import {
    Lider,
    getAll,
    getElementById,
    createElement,
    updateElement,
    deleteElement,
    getFuncionariosAtivos,
} from '@/services/lideresService'

const UNIDADES: { chave: string; descricao: string }[] = [
    { chave: 'Corpore_Way112', descricao: 'WAY 112' },
    { chave: 'Corpore_Way153', descricao: 'WAY 153' },
    { chave: 'Corpore_Way262', descricao: 'WAY 262' },
    { chave: 'Corpore', descricao: 'WAY 306' },
    { chave: 'Corpore_Way364', descricao: 'WAY 364' },
    { chave: 'Corpore_Migra', descricao: 'WAY MIGRA' },
    { chave: 'Corpore_Holding', descricao: 'WAY PJ' },
]

function unidadeDescricao(chave: string) {
    return UNIDADES.find(u => u.chave === chave)?.descricao ?? chave
}

type Funcionario = { nim: string; name: string; internal_number: string }

interface LiderComboboxProps {
    control: Control<Lider>
    fieldName: 'lider_imediato' | 'lider_mediato'
    label: string
    funcionarios: Funcionario[]
}

function LiderCombobox({ control, fieldName, label, funcionarios }: LiderComboboxProps) {
    const [open, setOpen] = useState(false)
    return (
        <FormField
            control={control}
            name={fieldName}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <Popover modal={true} open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    type="button"
                                    variant="outline"
                                    role="combobox"
                                    className={cn('w-full justify-between font-normal', !field.value && 'text-muted-foreground')}
                                >
                                    {field.value || 'Selecione...'}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                            <Command>
                                <CommandInput placeholder="Buscar por nome, NIM ou matrícula..." />
                                <CommandList>
                                    <CommandEmpty>Nenhum funcionário encontrado.</CommandEmpty>
                                    <CommandGroup>
                                        <CommandItem value="" onSelect={() => { field.onChange(''); setOpen(false) }}>
                                            <Check className={cn('mr-2 h-4 w-4', !field.value ? 'opacity-100' : 'opacity-0')} />
                                            Nenhum
                                        </CommandItem>
                                        {funcionarios.map(f => (
                                            <CommandItem
                                                key={f.nim}
                                                value={`${f.name} ${f.nim} ${f.internal_number}`}
                                                onSelect={() => { field.onChange(f.name); setOpen(false) }}
                                            >
                                                <Check className={cn('mr-2 h-4 w-4', field.value === f.name ? 'opacity-100' : 'opacity-0')} />
                                                {f.name}
                                                {f.nim && <span className="ml-2 text-xs text-muted-foreground">{f.nim}</span>}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

export default function LideresPage() {
    const titulo = 'Líderes'
    const router = useRouter()
    const searchParams = useSearchParams()
    const [query, setQuery] = useState<string>(searchParams.get('q') ?? '')
    const [results, setResults] = useState<Lider[]>([])
    const [resultById, setResultById] = useState<Lider | undefined>()
    const [searched, setSearched] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [updateMode, setUpdateMode] = useState(false)
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
    const debounceRef = useRef<NodeJS.Timeout | null>(null)
    const loading = isPending

    const defaultValues: Lider = {
        unidade: '',
        codigosecao: '',
        lider_imediato: '',
        lider_mediato: '',
        cargo_lider_mediato: '',
    }

    const form = useForm<Lider>({ defaultValues })

    function clearQuery() { setQuery('') }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSearchClick()
        }
    }

    useEffect(() => {
        handleSearch(searchParams.get('q') ?? '')
        getFuncionariosAtivos().then(setFuncionarios).catch(() => {})
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
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
    }, [query])

    async function handleSearch(q: string) {
        setError(null)
        try {
            const dados = await getAll()
            const qNorm = stripDiacritics(q.toLowerCase().trim())
            const filtrados = qNorm
                ? dados.filter(p =>
                    String(p.sequencial ?? '').includes(qNorm) ||
                    stripDiacritics(unidadeDescricao(p.unidade ?? '').toLowerCase()).includes(qNorm) ||
                    stripDiacritics((p.codigosecao ?? '').toLowerCase()).includes(qNorm) ||
                    stripDiacritics((p.lider_imediato ?? '').toLowerCase()).includes(qNorm) ||
                    stripDiacritics((p.lider_mediato ?? '').toLowerCase()).includes(qNorm) ||
                    stripDiacritics((p.cargo_lider_mediato ?? '').toLowerCase()).includes(qNorm)
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
            toast.success('Registro excluído')
        } catch (err) {
            toast.error((err as Error).message)
        } finally {
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
                sequencial: response.sequencial,
                unidade: response.unidade ?? '',
                codigosecao: response.codigosecao ?? '',
                lider_imediato: response.lider_imediato ?? '',
                lider_mediato: response.lider_mediato ?? '',
                cargo_lider_mediato: response.cargo_lider_mediato ?? '',
            })
            setIsModalOpen(true)
        } catch (err) {
            toast.error(`Erro ao carregar: ${(err as Error).message}`)
        }
    }

    function handleInsert() {
        form.reset(defaultValues)
        setUpdateMode(false)
        setIsModalOpen(true)
    }

    async function onSubmit(data: Lider) {
        setError(null)
        try {
            if (data.sequencial && data.sequencial !== 0) {
                await updateElement(data)
            } else {
                await createElement(data)
            }
            toast.success('Registro salvo')
        } catch (err) {
            toast.error((err as Error).message)
            return
        }
        form.reset()
        await handleSearchClick()
        setIsModalOpen(false)
    }

    const colunas = useMemo<ColumnDef<Lider>[]>(() => [
        { accessorKey: 'sequencial', header: 'ID' },
        {
            accessorKey: 'unidade',
            header: 'UNIDADE',
            cell: ({ row }: { row: Row<Lider> }) => (
                <span>{unidadeDescricao(row.original.unidade ?? '')}</span>
            ),
        },
        { accessorKey: 'codigosecao', header: 'CÓD. SEÇÃO' },
        { accessorKey: 'lider_imediato', header: 'LÍDER IMEDIATO' },
        { accessorKey: 'lider_mediato', header: 'LÍDER IMEDIATO 2' },
        { accessorKey: 'cargo_lider_mediato', header: 'CARGO LÍDER IMEDIATO' },
        {
            id: 'actions',
            header: 'AÇÕES',
            cell: ({ row }: { row: Row<Lider> }) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleUpdate(row.original.sequencial!)}>
                        Editar
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setDeleteId(row.original.sequencial!)}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ),
        },
    ], [])

    return (
        <div className="pt-6 pr-6">
            <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl font-bold">{titulo}</CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col gap-2 md:flex-row">
                    <div className="relative flex-1">
                        <Input
                            placeholder="Pesquise por qualquer campo"
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

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent
                    className="max-w-md overflow-y-auto max-h-[90vh]"
                    onInteractOutside={(e) => {
                        if ((e.target as HTMLElement).closest('[data-radix-popper-content-wrapper]')) {
                            e.preventDefault()
                        }
                    }}
                >
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-center">
                            {updateMode ? `Editar líder #${resultById?.sequencial}` : 'Novo líder'}
                        </DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">

                            <FormField
                                control={form.control}
                                name="unidade"
                                rules={{ required: 'Unidade é obrigatória' }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>UNIDADE</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione a unidade..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {UNIDADES.map(u => (
                                                    <SelectItem key={u.chave} value={u.chave}>
                                                        {u.descricao}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="codigosecao"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>CÓDIGO SEÇÃO</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <LiderCombobox
                                control={form.control}
                                fieldName="lider_imediato"
                                label="LÍDER IMEDIATO"
                                funcionarios={funcionarios}
                            />
                            <LiderCombobox
                                control={form.control}
                                fieldName="lider_mediato"
                                label="LÍDER IMEDIATO 2"
                                funcionarios={funcionarios}
                            />

                            <FormField
                                control={form.control}
                                name="cargo_lider_mediato"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>CARGO LÍDER IMEDIATO</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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
                        <h3 className="mb-2 text-base font-semibold">Excluir líder</h3>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Tem certeza que deseja excluir o registro #{deleteId}?
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
                            <Button variant="destructive" onClick={handleDeleteConfirmed}>Excluir</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
