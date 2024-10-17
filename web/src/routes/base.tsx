import React from "react";
import {LoginUserDTO} from "../base/data";
import {ProviderContext} from "notistack";
import {Autocomplete, Stack, TextField, Typography} from "@mui/material";

export type Toaster = ProviderContext;

export class SafeFetch<R = Response> {
    private readonly promise: Promise<Response>
    private readonly toaster: Toaster


    private readonly onSuccess?: (r: Response) => Promise<R>
    private readonly onError?: (r: Response) => Promise<R>
    private readonly onException?: (r: any) => Promise<R>

    constructor(toaster: Toaster, promise: Promise<Response>, onSuccess: (r: Response) => Promise<R>, onError: (r: Response) => Promise<R>, onException: (r: any) => Promise<R>) {
        this.toaster = toaster
        this.promise = promise;
        this.onSuccess = onSuccess;
        this.onError = onError;
        this.onException = onException;
    }

    async run(): Promise<R> {
        let r: Response;
        try {
            r = await this.promise
        } catch (e) {
            if (this.toaster) {
                showErrorMessage(this.toaster, "Failed request (unknown): " + e)
            }
            if (this.onException) {
                return this.onException(e)
            } else {
                throw e
            }
        }
        if (!r.ok) {
            if (this.toaster) {
                showErrorMessage(this.toaster, `Failed request (${r.status} ${r.statusText}):  + ${await r.text()}`)
            }
            if (this.onError) {
                return this.onError(r)
            } else {
                return r as R
            }
        } else {
            if (this.onSuccess) {
                return this.onSuccess(r)
            } else {
                return r as R
            }
        }
    }

}

export class SafeFetchBuilder<R = Response> {
    private readonly url: string
    private readonly init: RequestInit
    private readonly toaster: Toaster | null

    private _onSuccess?: (r: Response) => Promise<R>
    private _onError?: (r: Response) => Promise<R>
    private _onException?: (r: any) => Promise<R>

    public constructor(url: string, init: RequestInit | null, toaster: Toaster | null) {
        this.url = url;
        this.init = init ? init : undefined;
        this.toaster = toaster;
    }


    public onSuccess(value: (r: Response) => Promise<R>): SafeFetchBuilder<R> {
        this._onSuccess = value;
        return this
    }

    public onError(value: (r: Response) => Promise<R>): SafeFetchBuilder<R> {
        this._onError = value;
        return this
    }

    public onException(value: (r: any) => Promise<R>): SafeFetchBuilder<R> {
        this._onException = value;
        return this
    }

    build(): SafeFetch<R> {
        return new SafeFetch<R>(
            this.toaster,
            fetch(this.url, this.init),
            this._onSuccess,
            this._onError,
            this._onException
        )
    }

}

export function safeFetchBuilder<R>(toaster: Toaster | null, url: string, init: RequestInit | null): SafeFetchBuilder<R> {
    return new SafeFetchBuilder(url, init, toaster)
}


export async function authorizedPatch<T, R>(toaster: Toaster | undefined, url: string, body?: T): Promise<R> {
    return authorizedFetch(toaster, url, "patch", body)
}

export async function authorizedPost<T, R = any>(toaster: Toaster | undefined, url: string, body?: T): Promise<R> {
    return authorizedFetch(toaster, url, "post", body)
}

export async function authorizedGet<R>(toaster: Toaster | undefined, url: string): Promise<R> {
    return authorizedFetch(toaster, url, "get")
}

export async function authorizedFetch<T, R>(toaster: Toaster | undefined, url: string, method: string, body?: T): Promise<R> {
    async function onSuccess(r: Response): Promise<R> {
        return await r.json()
    }

    async function onError(r: Response): Promise<R> {
        if (r.status == 401) {
            window.location.href = "/login"
        } else throw r.status
    }

    let token = localStorage.getItem("jwt_token")
    return new SafeFetchBuilder<R>(url, {
        method: method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: body ? JSON.stringify(body) : undefined
    }, toaster)
        .onSuccess(onSuccess)
        .onError(onError)
        .build()
        .run()


}

export function showOkMessage(toaster: Toaster, msg: string) {
    toaster.enqueueSnackbar("Success!", {variant: "success"})
}

export function showErrorMessage(toaster: Toaster, msg: string) {
    toaster.enqueueSnackbar("Success!", {variant: "error"})

}

export function LabeledInput(props: {
    name: string,
    children: any
}) {
    return <Stack direction="row" spacing={"16px"} style={{width: "100%"}}>
        <Typography>{props.name}</Typography>
        {props.children}
    </Stack>
}

export function NamePicker(props: {
    variants: LoginUserDTO[],
    value: LoginUserDTO,
    onChange: (_: LoginUserDTO) => void
}) {
    const mapped = props.variants
    return <Autocomplete
        sx={{
            minWidth: "200px"
        }}
        value={props.value}
        options={mapped}
        onChange={(_, v) => props.onChange(v)}
        renderInput={(params) => <TextField {...params} label="Имя"/>}
        renderOption={(params, option) => <Typography {...params}>{option.name}</Typography>}
        getOptionLabel={e => e.name}
    />
}

export function InputNumber(
    props: {
        value: number,
        onChange: (v: number) => void
    }
) {
    return <TextField slotProps={{htmlInput: {type: "number"}}} value={props.value}
                      onChange={e => props.onChange(parseInt(e.target.value))}/>
}

export function VStack(
    props: any
) {
    return <Stack spacing={".5em"} direction={"column"} {...props}/>
}

export function HStack(
    props: any
) {
    return <Stack spacing={".5em"} direction={"row"} {...props}/>
}
