import React, {useState} from "react";
import {LoginUserDTO, NewTransactionDTO} from "../../base/data";
import {useLoaderData} from "react-router-dom";
import {authorizedPost, InputNumber, NamePicker, showOkMessage, VStack} from "../base";
import {Section} from "./section";
import {useSnackbar} from "notistack";
import {Button, Icon, Typography} from "@mui/material";

export async function loader(): Promise<LoginUserDTO[]> {
    const r = await fetch("/api/login/users")
    return await r.json()
}

function LabeledInput(props: {
    name: string,
    children: any
}) {
    return <VStack>
        <Typography>{props.name}</Typography>
        {props.children}
    </VStack>
}

function AmountPicker(props: {
    value: number,
    setValue: (n: number) => void
}) {
    return <LabeledInput name={"Количество бабла"}>
        <InputNumber value={props.value} onChange={props.setValue}/>
    </LabeledInput>
}

function MakeTransaction() {
    const users = useLoaderData() as LoginUserDTO[]
    const [name, setName] = useState<LoginUserDTO>()
    const [amount, setAmount] = useState<number>()

    const toaster = useSnackbar()

    async function send() {
        await authorizedPost<NewTransactionDTO>(toaster, "/api/create_transaction", {
            amount: amount,
            author: name.id
        }).then(_ => showOkMessage(toaster, "Добавил!"))
    }

    return <VStack>
        <NamePicker variants={users} value={name} onChange={setName}/>
        <AmountPicker value={amount} setValue={setAmount}/>
        <Button disabled={!name || !amount} onClick={send}>Отправить</Button>
    </VStack>
}

export const makeTransactionSection : Section = {
    path: "/new_transaction",
    element: <MakeTransaction/>,
    loader: loader,
    icon: <Icon>reorder</Icon>,
    name: "Записать",
    adminOnly: true
}

