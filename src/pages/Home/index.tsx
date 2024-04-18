import { ConfigBlock, ConnectError, ConnectState, Footer } from "@/components";
import React from "react";
import { GlobalModelState, connect, useIntl } from "umi";
import styles from "./index.less";

interface HomeProps {
    userConfig: LooseObject
}

const HomePage: React.FC<HomeProps> = ({ userConfig }) => {
    const { formatMessage } = useIntl();

    return (
        <>
            <ConnectError />
            <div className={styles.homePage}>
                <ConnectState />
                <ConfigBlock />
            </div>
            <Footer
                url={`https://${userConfig.domain}.freshdesk.com`}
                message={formatMessage({ id: "home.toCRM" })}
                config={{
                    domain: userConfig.domain,
                    apiKey: userConfig.apiKey,
                }}
            />
        </>
    );
};

export default connect(
    ({ global }: { global: GlobalModelState }) => ({
        userConfig: global.userConfig
    })
)(HomePage);
