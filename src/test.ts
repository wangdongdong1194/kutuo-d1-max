import { AnbotApiClient } from "./agiquad.api";
import { AnbotWsClient } from "./agiquad.ws";

async function main() {
    // const w = new AnbotWsClient('wss://www.anbotcloud.cn/anbotwebsocket/fc7eab90a72f4700bdfe492332f43353/1.0.0');

    const apiClient = new AnbotApiClient({
        version: '1.0.0',
        key: 'fc7eab90a72f4700bdfe492332f43353',
        mapId: 7030,
        robotId: '26WG511025',
        baseURL: 'https://www.anbotcloud.cn'
    });
    const t = await apiClient.getRobotStatus();
    console.log(t);
}
main();