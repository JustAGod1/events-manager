import React, {CSSProperties, useState} from "react";
import {
    CreateGoodRequestDTO,
    GoodLogDTO,
    GoodRequestDTO,
    MoneyTransactionDTO,
    PatchGoodRequestDTO
} from "../../base/data";
import {authorizedGet, authorizedPost, HStack, InputNumber, showOkMessage, VStack} from "../base";
import {Section} from "./section";
import {useLoaderData, useRevalidator} from "react-router-dom";
import Color from "https://colorjs.io/dist/color.js";
import {BarChart} from "@mui/x-charts";
import DataGrid, {Column} from "react-data-grid";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Divider,
    Icon,
    Modal,
    TextField,
    Typography
} from "@mui/material";
import {useSnackbar} from "notistack";
import {ExpandMore} from "@mui/icons-material";

const cardCss: CSSProperties = {
    border: "solid 1px gray",
    borderRadius: "8px",
}

class GoodsData {
    transactions: MoneyTransactionDTO[]
    goods: GoodRequestDTO[]
    logs: GoodLogDTO[]


    constructor(transactions: MoneyTransactionDTO[], goods: GoodRequestDTO[], logs: GoodLogDTO[]) {
        this.transactions = transactions;
        this.goods = goods;
        this.logs = logs;
    }
}

function GoodEditor(props: {
    info: GoodRequestDTO,
    open: boolean,
    setOpen: (v: boolean) => void
}) {
    const [count, setCount] = useState<number>(props.info.count)
    const [cost, setCost] = useState<number>(props.info.cost)

    const toaster = useSnackbar()

    const revalidator = useRevalidator()

    async function save() {
        await authorizedPost<PatchGoodRequestDTO>(
            toaster,
            "/api/goods/patch",
            {
                id: props.info.id,
                info: {
                    name: props.info.name,
                    importancy: props.info.importancy,
                    count: props.info.count,
                    cost: props.info.cost,
                }
            }
        )

        revalidator.revalidate()
        props.setOpen(false)
    }

    async function del() {
        await authorizedPost<number>(
            toaster,
            "/api/goods/del",
            props.info.id
        )

        revalidator.revalidate()
        props.setOpen(false)
    }

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    return <Modal
        open={props.open}
        onClose={_ => props.setOpen(false)}
    >
        <VStack sx={style} spacing={"1em"}>
            <Typography variant={"h2"}>
                {props.info.name}
            </Typography>

            <div
                style={{
                    display: "grid",
                    gridAutoRows: "1fr",
                    gridTemplateColumns: "1fr 1fr"
                }}
            >

                <Typography>Количество</Typography>
                <InputNumber value={count} onChange={setCount}/>

                <Typography>Примерная цена за штуку</Typography>
                <InputNumber value={cost} onChange={setCost}/>
            </div>

            <Button color={"success"} variant={"contained"} onClick={save}>
                Сохранить
            </Button>
            <Button color={"error"} variant={"outlined"} onClick={del}>
                Удалить
            </Button>
            <Button color={"secondary"} onClick={_ => props.setOpen(false)}>
                Закрыть
            </Button>
        </VStack>
    </Modal>
}

function Plus() {
    return <Icon>add</Icon>
}

function Minus() {
    return <Icon>remove</Icon>
}

function Edit() {
    return <Icon>edit</Icon>
}

function IconButton(props: {
    onClick: () => void,
    children: any
}) {
    return <Button onClick={props.onClick} sx={{padding: "1em"}} variant={"outlined"}>
        {props.children}
    </Button>
}

function PlusButton(props: {
    onClick: () => void
}) {
    return <IconButton onClick={props.onClick}>
        <Plus/>
    </IconButton>
}

function MinusButton(props: {
    onClick: () => void
}) {
    return <IconButton onClick={props.onClick}>
        <Minus/>
    </IconButton>
}

function GoodCard(props: {
    info: GoodRequestDTO,
    minPriority: number,
    maxPriority: number,
}) {

    const delta = props.maxPriority - props.minPriority
    const myDelta = props.info.importancy - props.minPriority
    const importancyPosition = delta == 0 ? 0 : myDelta / delta

    const gray = new Color("gray")
    const red = new Color("red")

    const borderColor = gray.range(red)(importancyPosition)

    const revalidator = useRevalidator()
    const toaster = useSnackbar()

    const [modalOpen, setModalOpen] = useState<boolean>(false)

    async function sendSimple(route: string, msg: string) {
        await authorizedPost<number>(toaster, route, props.info.id)
        showOkMessage(toaster, msg)
        revalidator.revalidate()
    }

    async function incImportancy() {
        await sendSimple("/api/goods/inc_imp", "Увеличил")
    }

    async function decImportancy() {
        await sendSimple("/api/goods/dec_imp", "Уменьшил")
    }

    async function incCount() {
        await sendSimple("/api/goods/inc_cnt", "Увеличил")
    }

    async function decCount() {
        await sendSimple("/api/goods/dec_cnt", "Уменьшил")
    }

    return <Accordion
        style={{width: "100%", padding: "2em", border: "solid 2px", borderRadius: "8px", borderColor: borderColor}}>
        <AccordionSummary expandIcon={<ExpandMore/>}>
            <Typography variant={"h4"} fontWeight={"bold"}>
                {props.info.name}
            </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{width: "100%"}}>
            <VStack style={{marginBottom: "16px"}}>
                <Typography style={{color: "gray"}}>
                    Предложил: {props.info.author.name}
                </Typography>
            </VStack>
            <HStack>
                Важность:
                <Typography
                    style={{
                        color: borderColor
                    }}>{props.info.importancy}</Typography>
            </HStack>
            <HStack>
                <MinusButton onClick={decImportancy}/>
                <PlusButton onClick={incImportancy}/>
            </HStack>
            <HStack>
                Количество:
                {props.info.count}
            </HStack>
            <HStack>
                <MinusButton onClick={decCount}/>
                <PlusButton onClick={incCount}/>
            </HStack>
            <Typography>
                {`${props.info.cost * props.info.count}₽`}
            </Typography>
            <Typography style={{color: "gray"}}>
                За штуку: {`~${props.info.cost}₽`}
            </Typography>
            <IconButton onClick={() => setModalOpen(true)}><Edit/></IconButton>
            <GoodEditor info={props.info} open={modalOpen} setOpen={setModalOpen}/>
        </AccordionDetails>
    </Accordion>
}

function CreateGoodRequest() {
    const [name, setName] = useState<string>()
    const [count, setCount] = useState<number>()
    const [cost, setCost] = useState<number>()

    const toaster = useSnackbar()

    const revalidator = useRevalidator()

    async function create() {
        await authorizedPost<CreateGoodRequestDTO>(
            toaster,
            "/api/goods/new",
            {
                name: name,
                cost: cost,
                count: count,
                importancy: 0
            }
        )

        revalidator.revalidate()
    }

    return <VStack style={{padding: "1em", ...cardCss}}>
        <Typography>Создать запрос</Typography>
        <VStack>
            Имя
            <TextField value={name} onChange={e => setName(e.target.value)}/>
        </VStack>
        <VStack>
            Количество
            <InputNumber value={count} onChange={setCount}/>
        </VStack>
        <VStack>
            Примерная цена за штуку
            <InputNumber value={cost} onChange={setCost}/>
        </VStack>
        <Button color={"success"} variant={"contained"} disabled={!name || !cost || !count}
                onClick={create}>Создать</Button>
    </VStack>
}

function GoodsContainer(props: {
    children?: any
}) {
    return <Box>
        <Typography variant={"h3"}>Заказы</Typography>
        <Box
            sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                gap: ".5em",
                justifyContent: "center"
            }}
        >
            {props.children}
        </Box>
    </Box>
}

function LogsGrid(props: {
    logs: GoodLogDTO[]
}) {
    const columns: Column<GoodLogDTO>[] = [
        {
            key: "time",
            name: "Время",
            renderCell: e => e.row.creationTime,
        },
        {
            key: "author",
            name: "Автор",
            renderCell: e => e.row.author.name,
        },
        {
            key: "target",
            name: "Имя",
            renderCell: e => e.row.target.name,
        },
        {
            key: "msg",
            name: "Сообщение",
            renderCell: e => e.row.message,
        },
    ]
    return <VStack alignItems={"center"} style={{width: "100%"}} spacing={1}>

        <Typography variant={"h4"}>История</Typography>
        <DataGrid className={"rdg-dark"} style={{width: "100%"}} columns={columns} rows={props.logs}/>
    </VStack>
}

function Goods() {
    const data = useLoaderData() as GoodsData

    const importancies = data.goods.map(a => a.importancy)
    const minImportancy = Math.min(0, Math.min(...importancies))
    const maxImportancy = Math.max(10, Math.max(...importancies))

    function add(accumulator: number, a: number): number {
        return accumulator + a;
    }

    const totalCost = data.goods.map(a => a.cost * a.count).reduce(add, 0)
    const totalCollected = data.transactions.map(a => a.amount).reduce(add, 0)

    return <VStack divider={<Divider/>} style={{width: "100%"}}>
        <Typography variant={"h3"}>
            Сбор пожеланий продуктов
        </Typography>
        <BarChart
            series={[
                {data: [totalCost], label: "Нужно денег"},
                {data: [totalCollected], label: "Собрали денег"},
            ]}
            layout="horizontal"
            width={800}
            height={500}
        />
        <GoodsContainer>
            {data.goods.map(a => <GoodCard key={a.id} info={a} minPriority={minImportancy}
                                           maxPriority={maxImportancy}/>)}
        </GoodsContainer>
        <CreateGoodRequest/>
        <LogsGrid logs={data.logs}/>
    </VStack>
}

async function loader(): Promise<GoodsData> {
    const goods = await authorizedGet<GoodRequestDTO[]>(null, "/api/goods")
    const transactions = await authorizedGet<MoneyTransactionDTO[]>(null, "/api/transactions")
    const logs = await authorizedGet<GoodLogDTO[]>(null, "/api/goods/logs")

    return new GoodsData(transactions, goods, logs)
}

export const goodsSection: Section = {
    path: "/requests",
    element: <Goods/>,
    loader: loader,
    icon: <Icon>shopping_cart</Icon>,
    name: "Чо купить",
    adminOnly: false
}