import React, {useState} from "react";
import {Button, InputNumber, Text, useToaster, VStack} from "rsuite";
import {default as List} from "@rsuite/icons/legacy/List";
import {LoginUserDTO, NewTransactionDTO} from "../../base/data";
import {useLoaderData} from "react-router-dom";
import {authorizedPost, NamePicker, showOkMessage} from "../base";
import {Section} from "./section";

export async function loader(): Promise<LoginUserDTO[]> {
    const r = await fetch("/api/login/users")
    return await r.json()
}

function LabeledInput(props: {
    name: string,
    children: any
}) {
    return <VStack>
        <Text>{props.name}</Text>
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

    const toaster = useToaster()

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
    icon: <List/>,
    name: "Записать деньги",
    adminOnly: true
}

