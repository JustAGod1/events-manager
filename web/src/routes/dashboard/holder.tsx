import React from "react";
import {Link, Outlet, useLoaderData, useMatches} from "react-router-dom";
import {Section} from "./section";
import {authorizedGet, VStack} from "../base";
import {EventInfoDTO, ParticipantDTO} from "../../base/data";
import {BottomNavigation, BottomNavigationAction, Box, Paper} from "@mui/material";

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
    icon: React.Element,
    value: number
}) {
    return <BottomNavigationAction
        label={props.name} icon={props.icon} component={Link} to={props.to} value={props.value} showLabel/>
}

function ManagerNavigation(props: {
    sections: Section[],
    user: ParticipantDTO
}) {
    const toDisplay = props.sections
        .filter(e => !e.adminOnly || props.user.admin)


    const matches = useMatches()

    console.log(matches)

    let selected = null

    for (let i = 0; i < toDisplay.length; i++) {
        if (matches.find(e => e.pathname == toDisplay[i].path)) {
            selected = i
            break
        }
    }
    console.log(selected)

    return <Paper
        sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
        }}
    >
        <BottomNavigation
            sx={{
                elevation: 3,
                padding: "2em",
            }}
            value={selected}
        >
            {
                toDisplay.map((e, i) => <NavPill name={e.name} to={e.path} icon={e.icon} value={i}/>)
            }
        </BottomNavigation>
    </Paper>
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
    return <Box sx={{height: "100%", width: "100%"}}>
        <Box sx={{
            padding: ".5em"
        }}>
            <Outlet/>
        </Box>
        <ManagerNavigation sections={props.sections} user={data.user}/>
    </Box>
}