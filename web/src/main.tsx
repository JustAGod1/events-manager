import React from 'react';
import ReactDOM from 'react-dom/client';
import './main.less';
import {Button, CustomProvider} from "rsuite";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {Login, loginLoader} from "./routes/login";
import {Holder, holderLoader} from "./routes/dashboard/holder";
import {Section} from "./routes/dashboard/section";
import {aboutSection} from "./routes/dashboard/about_event";
import {aboutMeSection} from "./routes/dashboard/about_me";
import {makeTransactionSection} from "./routes/dashboard/make_transaction";
import {moneyChartSection} from "./routes/dashboard/money_chart";
import {goodsSection} from "./routes/dashboard/goods";
import {createTheme, ThemeProvider} from "@mui/material";

const sections: Section[] = [aboutSection, aboutMeSection, moneyChartSection, goodsSection, makeTransactionSection]

const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login/>,
        loader: loginLoader
    },
    {
        path: "/",
        element: <Holder sections={sections}/>,
        loader: holderLoader,
        children: sections

    }
])

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});


ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <CustomProvider theme="dark">
            <ThemeProvider theme={darkTheme}>
                <RouterProvider router={router} />
            </ThemeProvider>
        </CustomProvider>
    </React.StrictMode>
);