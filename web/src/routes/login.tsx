import React, {useState} from "react";
import {LoginUserDTO} from "../base/data";
import {useLoaderData} from "react-router-dom";
import {LabeledInput, NamePicker, safeFetchBuilder} from "./base";
import {Button, Stack, TextField, Typography} from "@mui/material";
import {useSnackbar} from "notistack";


function PasswordInput(props: {
    value: string,
    onChange: (_: string) => void
}) {
    return <LabeledInput name={"Пароль:"}>
        <TextField name={"password"} value={props.value} onChange={e => props.onChange(e.target.value)}/>
    </LabeledInput>
}

function LoginPanel() {
    const users = useLoaderData() as LoginUserDTO[]
    const [name, setName] = useState<LoginUserDTO>()
    const [password, setPassword] = useState<string>()

    const needPassword = name?.hasPassword ?? false

    const toaster = useSnackbar()

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

    return <Stack direction="column" alignItems={"center"} spacing={"24px"}>
        <Typography fontWeight={"bold"}>
            Hello
        </Typography>
        <Stack direction="column" spacing={"16px"}>
            <NamePicker variants={users} value={name} onChange={setName}/>
            {
                needPassword ? <PasswordInput value={password} onChange={setPassword}/> : undefined
            }
        </Stack>

        <Button disabled={!name} onClick={authorize}>Login</Button>

    </Stack>
}

export async function loginLoader(): Promise<LoginUserDTO[]> {
    const r = await fetch("/api/login/users")
    return await r.json()
}

export function Login() {
    return <Stack direction={"column"} justifyContent={"center"} style={{height: "100%"}}>
        <Stack direction={"row"} justifyContent={"center"} style={{width: "100%"}}>
            <LoginPanel/>
        </Stack>
    </Stack>
}