import React from "react";
import {EventInfoDTO} from "../../base/data";
import {Section} from "./section";
import {authorizedGet, VStack} from "../base";
import {useLoaderData} from "react-router-dom";
import {Icon, Typography} from "@mui/material";



function AboutEvent() {
    const info = useLoaderData() as EventInfoDTO
    return <VStack style={{width: "100%"}}>
        <VStack alignItems={"center"} style={{width: "100%"}}>
            <Typography variant={"h3"}>
                {info.name}
            </Typography>
        </VStack>
        <VStack>
                {info.info}
        </VStack>
    </VStack>
}

async function loader(): Promise<EventInfoDTO> {
    return await authorizedGet(null, "/api/info")
}

export const aboutSection: Section = {
    path: "/info",
    name: "О событии",
    icon: <Icon>info</Icon>,
    element: <AboutEvent/>,
    loader: loader
}