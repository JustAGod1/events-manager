import React, {useId, useState} from "react";
import {Button, HStack, Input, InputPicker, Text, useToaster, VStack} from "rsuite";
import {LoginUserDTO} from "../base/data";
import {useLoaderData} from "react-router-dom";
import {LabeledInput, NamePicker, safeFetchBuilder} from "./base";



function PasswordInput(props: {
    value: string,
    onChange: (_: string) => void
}) {
    return <LabeledInput name={"Пароль:"}>
        <Input name={"password"} value={props.value} onChange={props.onChange}/>
    </LabeledInput>
}

function LoginPanel() {
    const users = useLoaderData() as LoginUserDTO[]
    const [name, setName] = useState<LoginUserDTO>()
    const [password, setPassword] = useState<string>()

    const needPassword = name?.hasPassword ?? false

    const toaster = useToaster()

    async function authorize() {
        let body = new FormData()
        if (name) {
            body.append("login", name.name)
        }
        if (name.hasPassword && password) {
            body.append("password", password)
        }
        const _ = await safeFetchBuilder<void>(toaster, "/api/login", {
                method: "post",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name?.name,
                    password: name.hasPassword ? password : undefined
                })
            }
        )
            .onSuccess(async r => {
                const data = await r.text()
                console.log(data)
                localStorage.setItem("jwt_token", data)
                window.location.href = '/';
            })
            .build().run()
    }

    return <VStack alignItems={"center"} spacing={"24px"}>
        <Text weight={"bold"}>
            Hello motherfucker
        </Text>
        <VStack spacing={"16px"}>
            <NamePicker variants={users} value={name} onChange={setName}/>
            {
                needPassword ? <PasswordInput value={password} onChange={setPassword}/> : undefined
            }
        </VStack>

        <Button disabled={!name} onClick={authorize}>Login</Button>

    </VStack>
}

export async function loginLoader(): Promise<LoginUserDTO[]> {
    const r = await fetch("/api/login/users")
    return await r.json()
}

export function Login() {
    return <VStack justifyContent={"center"} style={{height: "100%"}}>
        <HStack justifyContent={"center"} style={{width: "100%"}}>
            <LoginPanel/>
        </HStack>
    </VStack>
}