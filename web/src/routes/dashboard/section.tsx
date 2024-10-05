import {NonIndexRouteObject} from "react-router-dom";
import React from "react";

export interface Section extends NonIndexRouteObject {
    name: string
    icon: React.Element,
    adminOnly: boolean
}