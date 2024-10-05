import React from "react";
import {EventInfoDTO} from "../../base/data";
import {Section} from "./section";
import {authorizedGet} from "../base";
import {Heading, Text, VStack} from "rsuite";
import {useLoaderData} from "react-router-dom";

import Info from '@rsuite/icons/legacy/Info';


function AboutEvent() {
    const info = useLoaderData() as EventInfoDTO
    return <VStack style={{width: "100%"}}>
        <VStack alignItems={"center"} style={{width: "100%"}}>
            <Heading as={"h3"}>
                {info.name}
            </Heading>
        </VStack>
        <VStack>
            <Text>
                {info.info}
            </Text>
        </VStack>
    </VStack>
}

async function loader(): Promise<EventInfoDTO> {
    return await authorizedGet(null, "/api/info")
}

export const aboutSection: Section = {
    path: "/info",
    name: "О событии",
    icon: <Info/>,
    element: <AboutEvent/>,
    loader: loader
}