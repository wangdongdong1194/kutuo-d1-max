import axios, { type AxiosInstance } from 'axios';
import { IAnbotApiClientConfig, ICommonResponse, ICorrectPositionParam, ICorrectPositionResult, IEmergencyControl, IEmergencyResult, IGetCameraUrlParam, IGetCameraUrlResult, IGetRobotStatusResult, IInitPositionParam, IInitPositionResult, IInteractiveSOSParam, IInteractiveSOSResult, IMediaPlayParam, IMediaPlayResult, INavigationStartParam, INavigationStartResult, INavigationStopParam, INavigationStopResult, IRealTimeCallParam, IRealTimeCallResult, IRemoteControlResult, IRemoteControlSpeed, IRobotLightParam, IRobotLightResult, ISinglePointNavPosition, ISinglePointNavResult } from "./type";

/**
 * SDK 统一错误：传输错误（网络/超时/HTTP 非 2xx）和业务失败（statusCode 非 200）都会抛这个。
 * 只保留简洁字段，不携带 axios 的 request/response 大对象，打印干净。
 */
export class AnbotApiError extends Error {
    readonly statusCode: string;
    readonly statusInfo: string;
    readonly requestId: string;

    constructor(message: string, options: { statusCode?: string; statusInfo?: string; requestId?: string } = {}) {
        super(message);
        this.name = 'AnbotApiError';
        this.statusCode = options.statusCode ?? '';
        this.statusInfo = options.statusInfo ?? '';
        this.requestId = options.requestId ?? '';
    }
}

export class AnbotApiClient {
    private version: string;
    private key: string;
    private mapId: number;
    private robotId: string;

    /** 业务成功状态码，见 ICommonResponse.statusCode：200成功 */
    private successCode: string = '200';

    private http: AxiosInstance;

    constructor(config: IAnbotApiClientConfig) {
        const {
            version,
            key,
            mapId,
            robotId,
            baseURL
        } = config;
        this.version = version;
        this.key = key;
        this.mapId = mapId;
        this.robotId = robotId;
        this.http = axios.create({
            baseURL,
            timeout: 10_000,
        });
    }

    /**
     * 2.1.1 机器人急停指令
     *
     * 通过软件指令控制机器人紧急停止
     * @param p
     * @returns IEmergencyResult
     */
    async emergency(p: IEmergencyControl): Promise<IEmergencyResult> {
        const { control } = p;
        const body = {
            version: this.version,
            key: this.key,
            'module': 'walk',
            'function': 'emergency',
            requestId: this.getRequestId('walk', 'emergency'),
            'param': {
                robotId: this.robotId,
                control,
            },
        };
        return this.post<IEmergencyResult>(body);
    }

    /**
     * 2.1.2 机器人遥控行走指令
     *
     * 控制机器人进行前后左右方向的行走
     * @param p IRemoteControlSpeed
     * @returns IRemoteControlResult
     */
    async remoteControl(p: IRemoteControlSpeed): Promise<IRemoteControlResult> {
        const { lineSpeed, angleSpeed } = p;
        const body = {
            version: this.version,
            key: this.key,
            'module': 'walk',
            'function': 'remoteControl',
            requestId: this.getRequestId('walk', 'remoteControl'),
            'param': {
                robotId: this.robotId,
                lineSpeed,
                angleSpeed
            },
        };
        return this.post<IRemoteControlResult>(body);
    }

    /**
     * 2.1.3 单点导航指令[OK]
     *
     * 控制机器人到达机器人坐标系的某个位置
     * @param pos
     */
    async singlePointNav(p: ISinglePointNavPosition): Promise<ISinglePointNavResult> {
        const { positionX, positionY, positionAngle } = p;
        const body = {
            version: this.version,
            key: this.key,
            'module': 'walk',
            'function': 'singlePointNav',
            requestId: this.getRequestId('walk', 'singlepintnav'),
            'param': {
                robotId: this.robotId,
                mapId: this.mapId,
                'control': 1,
                positionX,
                positionY,
                positionAngle,
            },
        };

        return this.post<ISinglePointNavResult>(body);
    }

    /**
     * 2.1.4 查询机器人实时状态
     * 注意文档提示轮询间隔2S，不要频繁调用
     */
    async getRobotStatus(): Promise<IGetRobotStatusResult> {
        const body = {
            version: this.version,
            key: this.key,
            module: 'walk',
            function: 'getRobotStatus',
            requestId: this.getRequestId('walk', 'getRobotStatus'),
            param: {
                robotId: this.robotId
            }
        };
        return this.post<IGetRobotStatusResult>(body);
    }

    /**
     * 2.1.15 关闭自主导航 navigationStop
     * 关闭后机器人不会执行导航巡逻任务
     */
    async navigationStop(p: INavigationStopParam): Promise<INavigationStopResult> {
        const { robotId } = p;
        const requestId = 'cmd-walk-navigationStop-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        const body = {
            version: this.version,
            key: this.key,
            module: 'walk',
            function: 'navigationStop',
            requestId,
            param: {
                robotId
            }
        };
        return this.post<INavigationStopResult>(body);
    }

    /**
     * 2.1.14 开启自主导航 navigationStart
     * 开启后如果存在定时巡逻任务，则机器人自主执行
     * naviSwitch 字段会通过websocket状态上报推送开关状态
     */
    async navigationStart(p: INavigationStartParam): Promise<INavigationStartResult> {
        const { robotId } = p;
        const requestId = 'cmd-walk-navigationStart-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        const body = {
            version: this.version,
            key: this.key,
            module: 'walk',
            function: 'navigationStart',
            requestId,
            param: {
                robotId
            }
        };
        return this.post<INavigationStartResult>(body);
    }


    /**
     * 2.1.16 位置矫正指令 correctPosition
     * 在地图上设置机器人当前新坐标和角度
     */
    async correctPosition(p: ICorrectPositionParam): Promise<ICorrectPositionResult> {
        const { robotId, mapId, positionX, positionY, positionAngle } = p;
        const body = {
            version: this.version,
            key: this.key,
            module: 'walk',
            function: 'correctPosition',
            requestId: this.getRequestId('walk', 'correctPosition'),
            param: {
                robotId,
                mapId,
                positionX,
                positionY,
                positionAngle
            }
        };
        return this.post<ICorrectPositionResult>(body);
    }

    /**
     * 2.1.17 开机位置初始化 initPosition
     */
    async initPosition(p: IInitPositionParam): Promise<IInitPositionResult> {
        const { robotId, mapId, positionX, positionY, positionAngle } = p;
        const body = {
            version: this.version,
            key: this.key,
            module: 'walk',
            function: 'initPosition',
            requestId: this.getRequestId('walk', 'initPosition'),
            param: {
                robotId,
                mapId,
                positionX,
                positionY,
                positionAngle
            }
        };
        return this.post<IInitPositionResult>(body);
    }

    /**
     * 2.4.1 SOS告警指令下发 interactiveSOS
     * @param control 0关闭SOS，1开启SOS
     */
    async interactiveSOS(p: IInteractiveSOSParam): Promise<IInteractiveSOSResult> {
        const { robotId, control } = p;
        const body = {
            version: this.version,
            key: this.key,
            module: 'interact',
            function: 'interactiveSOS',
            requestId: this.getRequestId('interact', 'sos'),
            param: {
                robotId,
                control
            }
        };
        return this.post<IInteractiveSOSResult>(body);
    }

    /**
     * 2.4.2 实时喊话 realTimeCall
     * @param content 喊话内容，不超过50字符，需要机器人联网支持TTS
     */
    async realTimeCall(p: IRealTimeCallParam): Promise<IRealTimeCallResult> {
        const { robotId, content } = p;
        const body = {
            version: this.version,
            key: this.key,
            module: 'interact',
            function: 'realTimeCall',
            requestId: this.getRequestId('interact', 'realtimecall'),
            param: {
                robotId,
                content
            }
        };
        return this.post<IRealTimeCallResult>(body);
    }

    /**
     * 2.4.3 播放音频、视频、词条 mediaPlay
     * mediaType:1视频，2音频，3词条
     * playmode:0播放一次，1循环播放，2停止播放
     */
    async mediaPlay(p: IMediaPlayParam): Promise<IMediaPlayResult> {
        const { robotId, mediaCode, mediaType, playmode } = p;
        const body = {
            version: this.version,
            key: this.key,
            module: 'interact',
            function: 'mediaPlay',
            requestId: this.getRequestId('interact', 'mediaplay'),
            param: {
                robotId,
                mediaCode,
                mediaType,
                playmode
            }
        };
        return this.post<IMediaPlayResult>(body);
    }

    /**
     * 2.5.1 获取摄像头视频url getCameraUrl
     * 返回http/rtmp两类视频流地址
     */
    async getCameraUrl(p: IGetCameraUrlParam): Promise<IGetCameraUrlResult> {
        const { robotId } = p;
        const body = {
            version: this.version,
            key: this.key,
            module: 'video',
            function: 'getCameraUrl',
            requestId: this.getRequestId('video', 'getCameraUrl'),
            param: {
                robotId
            }
        };
        return this.post<IGetCameraUrlResult>(body);
    }

    /**
     * 4.11 警示灯光开关 robot/light
     * 【注意】该接口属于格式2接口，不是/apiRequest，直接post根路径
     * light: 1开启灯光，0关闭灯光
     */
    async robotLight(p: IRobotLightParam): Promise<IRobotLightResult> {
        const { robotId, light } = p;
        const body = {
            robotId,
            light
        };
        let data: IRobotLightResult;
        try {
            const res = await this.http.post<IRobotLightResult>(`/robot/remote/robot/light`, body, {
                headers: {
                    key: this.key
                }
            });
            data = res.data;
        } catch (err) {
            throw this.normalizeError(err);
        }

        // 格式2接口：code 0 表示成功
        if (data.code !== 0) {
            throw new AnbotApiError(
                data.message || `灯光控制失败（code: ${data.code}）`,
                { statusCode: String(data.code), statusInfo: data.message },
            );
        }
        return data;
    }

    private getRequestId(module: string, func: string) {
        return `cmd-${module}-${func}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    /**
     * 统一 POST /apiRequest，成功返回业务 data，失败抛 AnbotApiError。
     */
    private async post<T extends ICommonResponse>(body: unknown): Promise<T> {
        let data: T;
        try {
            const res = await this.http.post<T>('/apiRequest', body);
            data = res.data;
        } catch (err) {
            throw this.normalizeError(err);
        }

        if (String(data.statusCode ?? '') !== this.successCode) {
            throw new AnbotApiError(
                data.statusInfo || `业务请求失败（statusCode: ${data.statusCode}）`,
                { statusCode: String(data.statusCode ?? ''), statusInfo: data.statusInfo, requestId: data.requestId },
            );
        }

        return data;
    }

    /**
     * 把 axios 错误（网络/超时/HTTP 非 2xx）归一化成简洁的 AnbotApiError。
     */
    private normalizeError(err: unknown): AnbotApiError {
        if (axios.isAxiosError(err)) {
            const status = err.response?.status;
            const resData = err.response?.data as ICommonResponse | undefined;
            const message = status
                ? `HTTP ${status}${resData?.statusInfo ? '：' + resData.statusInfo : ''}`
                : (err.code === 'ECONNABORTED' ? '请求超时' : err.message);
            return new AnbotApiError(message, {
                statusCode: resData?.statusCode ?? (status != null ? String(status) : ''),
                statusInfo: resData?.statusInfo ?? '',
                requestId: resData?.requestId ?? '',
            });
        }
        return new AnbotApiError(err instanceof Error ? err.message : '未知错误');
    }
}
