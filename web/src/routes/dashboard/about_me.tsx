import React, {Component, useState} from "react";
import {EventInfoDTO, ParticipantDTO} from "../../base/data";
import {Section} from "./section";
import {authorizedGet, authorizedPatch, authorizedPost, showErrorMessage, showOkMessage} from "../base";
import {useLoaderData} from "react-router-dom";



function Field<T, C extends React.ElementType>({label, as, value, setValue, ...rest}: {
    label: string,
    as: C,
    value: T,
    setValue: (a: T) => void
}) {
    const Component = as
    return <HStack>
        <label style={{ width: 120, display: 'inline-block', color: 'var(--rs-text-secondary)' }}>
            {label}
        </label>
        <InlineEdit placeholder="Click to edit ..." value={value} onChange={setValue}>
            <Component style={{ width: 300 }} {...rest} />
        </InlineEdit>
    </HStack>
}

const TextArea = React.forwardRef((props, ref) => {
    return <Input as="textarea" ref={ref} {...props} />;
});

function AboutMe() {
    const info = useLoaderData() as ParticipantDTO
    const [name, setName] = useState(info.name)
    const [whois, setWhois] = useState(info.whois)

    const toaster = useToaster()

    async function save() {
        await authorizedPost<ParticipantDTO, void>(toaster, "/api/me",
            {
                id: info.id,
                name: name,
                whois: whois
            }
        ).then(
            e => showOkMessage(toaster, "Данные обновлены")
        )
    }

    return <VStack style={{width: "100%"}}>
        <Heading as={"h3"}>
            Ваш профиль
        </Heading>
        <Field label={"Имя"} as={Input} value={name} setValue={setName}/>
        <Field label={"Whois"} as={TextArea} value={whois} setValue={setWhois}/>
        <Button onClick={save}>Сохранить</Button>
    </VStack>
}

async function loader(): Promise<ParticipantDTO> {
    return await authorizedGet(null, "/api/me")
}

export const aboutMeSection: Section = {
    path: "/me",
    name: "Кто я?",
    icon: <User/>,
    element: <AboutMe/>,
    loader: loader
}