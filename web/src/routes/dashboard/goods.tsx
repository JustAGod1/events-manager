import React, {CSSProperties, useState} from "react";
import {
    CreateGoodRequestDTO,
    GoodLogDTO,
    GoodRequestDTO,
    MoneyTransactionDTO,
    PatchGoodRequestDTO
} from "../../base/data";
import {Button, Divider, Heading, HStack, Input, InputNumber, Modal, Text, useToaster, VStack} from "rsuite";
import {authorizedGet, authorizedPost, showOkMessage} from "../base";
import {Section} from "./section";
import ShoppingCart from "@rsuite/icons/legacy/ShoppingCart";
import Edit from "@rsuite/icons/legacy/Edit";
import Plus from "@rsuite/icons/legacy/Plus";
import Minus from "@rsuite/icons/legacy/Minus";
import {useLoaderData, useRevalidator} from "react-router-dom";
import Color from "https://colorjs.io/dist/color.js";
import {BarChart} from "@mui/x-charts";
import DataGrid, {Column} from "react-data-grid";

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

    const toaster = useToaster()

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

    return <Modal open={props.open} onClose={_ => props.setOpen(false)}>
        <Modal.Title>
            {props.info.name}
        </Modal.Title>
        <Modal.Body>
            <VStack>
                Количество
                <InputNumber value={count} onChange={setCount}/>
            </VStack>
            <VStack>
                Примерная цена за штуку
                <InputNumber value={cost} onChange={setCost}/>
            </VStack>
        </Modal.Body>
        <Modal.Footer>
            <Button color={"green"} onClick={save}>
                Сохранить
            </Button>
            <Button color={"red"} onClick={del}>
                Удалить
            </Button>

        </Modal.Footer>

    </Modal>
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
    const toaster = useToaster()

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

    return <VStack style={{padding: "16px", border: "solid 1px", borderRadius: "8px", borderColor: borderColor}}>
        <VStack style={{marginBottom: "16px"}}>
            <Text size={24} weight={"bold"}>
                {props.info.name}
            </Text>
            <Text style={{color: "gray"}}>
                Предложил: {props.info.author.name}
            </Text>
        </VStack>
        <HStack>
            Важность:
            <Text
                style={{
                    color: borderColor
                }}>{props.info.importancy}</Text>
        </HStack>
        <HStack>
            <Button onClick={decImportancy}>
                <Minus/>
            </Button>
            <Button onClick={incImportancy}>
                <Plus/>
            </Button>
        </HStack>
        <HStack>
            Количество:
            {props.info.count}
        </HStack>
        <HStack>
            <Button onClick={decCount}>
                <Minus/>
            </Button>
            <Button onClick={incCount}>
                <Plus/>
            </Button>
        </HStack>
        <Text size={16}>
            {`${props.info.cost * props.info.count}₽`}
        </Text>
        <Text size={12} style={{color: "gray"}}>
            За штуку: {`~${props.info.cost}₽`}
        </Text>
        <Button onClick={_ => setModalOpen(true)}><Edit/></Button>
        <GoodEditor info={props.info} open={modalOpen} setOpen={setModalOpen}/>
    </VStack>
}

function CreateGoodRequest() {
    const [name, setName] = useState<string>()
    const [count, setCount] = useState<number>()
    const [cost, setCost] = useState<number>()

    const toaster = useToaster()

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

    return <VStack spacing={24} style={{padding: "8px", ...cardCss}}>
        <Text>Создать запрос</Text>
        <VStack>
            Имя
            <Input value={name} onChange={setName}/>
        </VStack>
        <VStack>
            Количество
            <InputNumber value={count} onChange={setCount}/>
        </VStack>
        <VStack>
            Примерная цена за штуку
            <InputNumber value={cost} onChange={setCost}/>
        </VStack>
        <Button disabled={!name || !cost || !count} onClick={create}>Создать</Button>
    </VStack>
}

function GoodsContainer(props: {
    children?: any
}) {
    return <div
        style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: "8px"
        }}
    >
        {props.children}
    </div>
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
    return <VStack alignItems={"center"} style={{width: "100%"}} spacing={16}>

        <Heading>История</Heading>
        <DataGrid className={"rdg-dark"} style={{width: "75%"}} columns={columns} rows={props.logs}/>
    </VStack>
}

function Goods() {
    const data = useLoaderData() as GoodsData

    const importancies = data.goods.map(a => a.importancy)
    const minImportancy = Math.min(0, Math.min(...importancies))
    const maxImportancy = Math.max(100, Math.max(...importancies))

    function add(accumulator: number, a: number): number {
        return accumulator + a;
    }

    const totalCost = data.goods.map(a => a.cost * a.count).reduce(add, 0)
    const totalCollected = data.transactions.map(a => a.amount).reduce(add, 0)

    return <VStack divider={<Divider/>} style={{width: "100%"}}>
        <BarChart
            series={[
                {data: [totalCost], label: "Нужно"},
                {data: [totalCollected], label: "Собрали"},
            ]}
            layout="horizontal"
            width={500}
            height={300}
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
    const logs = await authorizedGet<MoneyTransactionDTO[]>(null, "/api/goods/logs")

    return new GoodsData(transactions, goods, logs)
}

export const goodsSection: Section = {
    path: "/requests",
    element: <Goods/>,
    loader: loader,
    icon: <ShoppingCart/>,
    name: "Чо купить",
    adminOnly: false
}