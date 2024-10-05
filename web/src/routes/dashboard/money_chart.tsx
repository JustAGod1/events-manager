import React from "react";
import {Section} from "./section";
import {Heading, VStack} from "rsuite";
import PieChart from "@rsuite/icons/legacy/PieChart";
import {authorizedGet} from "../base";
import {MoneyTransactionDTO} from "../../base/data";
import {useLoaderData} from "react-router-dom";
import {PieChart as MuiPieChart} from "@mui/x-charts";
import {createTheme, ThemeProvider} from "@mui/material";
import {Column} from "react-data-grid";
import 'react-data-grid/lib/styles.css';

import DataGrid from 'react-data-grid';

interface PieEntry {
    id: number
    value: number
    label: string
}

function makeSeries(raw: MoneyTransactionDTO[]): PieEntry[] {
    let buf = new Map<string, number>()
    for (let t of raw) {
        buf.set(t.author.name, (buf.get(t.author.name) ?? 0) + t.amount)
    }
    let idx = 0
    let result: PieEntry[] = []
    for (let [participant, value] of buf.entries()) {
        result.push({
            id: idx++,
            value: value,
            label: participant
        })
    }

    return result
}

function Chart(props: {
    series: PieEntry[]
}) {
    return <MuiPieChart
            series={[
                {
                    data: props.series,
                },
            ]}
            width={400}
            height={200}
        />
}

function TransactionsGrid(props: {
    transactions: MoneyTransactionDTO[]
}) {
    const columns: Column<MoneyTransactionDTO>[] = [
        {
            key: 'author',
            name: 'Автор',
            renderCell: v => v.row.author.name
        },
        {
            key: 'amount',
            name: 'Количество',
            renderCell: v => v.row.amount + "р."
        },
        {
            key: 'date',
            name: 'Время',
            renderCell: v => v.row.creationTime
        },
    ]

    return <VStack alignItems={"center"} style={{width: "100%"}} spacing={16}>

        <Heading>История</Heading>
        <DataGrid className={"rdg-dark"} style={{width: "75%"}} columns={columns} rows={props.transactions}/>
    </VStack>
}

function MoneyChart() {
    const transactions = useLoaderData() as MoneyTransactionDTO[]
    const series = makeSeries(transactions)

    return <VStack style={{width: "100%"}}>
        <VStack alignItems={"center"} style={{width: "100%"}} spacing={16}>
            <Heading>Статус сбора денег</Heading>
            <Chart series={series}/>
            <TransactionsGrid transactions={transactions}/>
        </VStack>
    </VStack>
}

async function loader(): Promise<MoneyTransactionDTO[]> {
    return await authorizedGet<MoneyTransactionDTO[]>(null, "/api/transactions")
}

export const moneyChartSection: Section = {
    path: "/charts",
    element: <MoneyChart/>,
    loader: loader,
    icon: <PieChart/>,
    name: "Общак",
    adminOnly: false
}