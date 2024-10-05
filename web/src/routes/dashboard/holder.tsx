import React, {useState} from "react";
import {Heading, HStack, Nav, Navbar, Sidenav, Text, VStack} from "rsuite";
import {Link, Outlet, useLoaderData, useMatch} from "react-router-dom";
import {Section} from "./section";
import {authorizedGet, authorizedPost} from "../base";
import {EventInfoDTO, ParticipantDTO} from "../../base/data";

class HolderInfo {
    info: EventInfoDTO
    user: ParticipantDTO

    constructor(info: EventInfoDTO, user: ParticipantDTO) {
        this.info = info;
        this.user = user;
    }
}

function NavPill(props: {
    name: string,
    to: string,
    icon: React.Element
}) {
    const match = useMatch(props.to) && true
    return <Nav.Item as={Link} id={props.to} icon={props.icon} active={match !== null} to={props.to}>
        {props.name}
    </Nav.Item>
}

function ManagerNavigation(props: {
    sections: Section[],
    user: ParticipantDTO
}) {
    const [expanded, setExpanded] = useState<boolean>(true)
    return <Sidenav style={{maxWidth: "250px", height: "100%"}} expanded={expanded}>
        <Sidenav.Body>
            <Nav>
                {props.sections
                    .filter(a => !a.adminOnly || props.user.admin)
                    .map(a => <NavPill name={a.name} to={a.path} icon={a.icon}/>)}
            </Nav>
        </Sidenav.Body>
        <Sidenav.Toggle onToggle={setExpanded}/>
    </Sidenav>

}

export async function holderLoader(): Promise<HolderInfo> {
    const info: EventInfoDTO = await authorizedGet(null, "api/info")
    const user: ParticipantDTO = await authorizedGet(null, "api/me")

    return new HolderInfo(info, user)
}

export function Holder(props: {
    sections: Section[]
}) {
    const data = useLoaderData() as HolderInfo
    return <VStack spacing={0} style={{height: "100%", width: "100%"}}>
        <Navbar style={{
            width: "100%",
            padding: "1em"
        }}>
            <Heading>
            {data.info.name}
            </Heading>
        </Navbar>
        <HStack style={{height: "100%", width: "100%"}}>
            <ManagerNavigation sections={props.sections} user={data.user}/>
            <HStack style={{height: "100%", padding: "1em", width: "100%"}} alignItems={"flex-start"}>
                <Outlet/>
            </HStack>
        </HStack>
    </VStack>
}