export interface IAnbotApiClientConfig {
    /** 协议版本号 */
    version: string;
    /** API密钥，由运维分配 */
    key: string;
    /** 当前地图ID */
    mapId: number;
    /** 机器人唯一ID */
    robotId: string;
    /** http请求基础地址 */
    baseURL: string;
}

export interface ICommonResponse {
    /** 协议版本 */
    version: string;
    /** 模块名称 */
    module: string;
    /** 接口功能名称 */
    function: string;
    /** 请求唯一ID */
    requestId: string;
    /** 状态码：200成功，400失败，500服务内部出错 */
    statusCode: string;
    /** 状态描述信息 */
    statusInfo: string;
}

/**
 * 单点导航位置参数
 */
export interface ISinglePointNavPosition {
    /** 点位X */
    positionX: string;
    /** 点位Y */
    positionY: string;
    /** 到点之后的角度。到达点位后，转动角度 */
    positionAngle: string;
}

/**
 * 单点导航接口返回结果
 */
export interface ISinglePointNavResult extends ICommonResponse {
    module: 'walk';
    function: 'singlePointNav';
}

/**
 * 机器人遥控行走速度参数
 */
export interface IRemoteControlSpeed {
    /** 线速度，正数向前，负数向后 */
    lineSpeed: number;
    /** 角速度，正数向左转，负数向右转 */
    angleSpeed: number;
}

/**
 * 遥控行走接口返回结果
 */
export interface IRemoteControlResult extends ICommonResponse {
    module: 'walk';
    function: 'remoteControl';
}

/**
 * 机器人急停控制参数
 */
export interface IEmergencyControl {
    /** 0 设置急停；1 取消急停 */
    control: 0 | 1;
}

/**
 * 急停指令返回结果
 */
export interface IEmergencyResult extends ICommonResponse {
    module: 'walk';
    function: 'emergency';
}

// ====================== 2.1.4 查询机器人实时状态 ======================
/**
 * 配送箱信息
 */
export interface IRobotBoxInfo {
    /** 0关，1开，401舵机通讯超时 */
    leftGateStatus: number;
    /** 0关，1开，401舵机通讯超时 */
    rightGateStatus: number;
    /** 0关1开，制冷开关 */
    refrigerationSwitchState?: number;
    /** 401温度通讯超时，箱内温度值 */
    currentTemperature?: number;
}

/**
 * 查询机器人实时状态 - 返回param对象
 */
export interface IGetRobotStatusResultParam {
    /** 当前电量 */
    power: number;
    /** 机器人运行状态 */
    realtimeStatus: 'idleState' | 'remoteControlState' | 'navigationState' | 'chargeState'
    | 'emergencyStopState' | 'upgradeState' | 'chargeNav' | 'mappingState'
    | 'initState' | 'patrol' | 'charging' | 'fault' | 'sosStatus' | 'stronglyAutonomousState' | 'unknown';
    /** 0离线 1在线，行走子系统在线状态 */
    status: number;
    /** 交互子系统在线状态 0离线，1在线 */
    interactOnline: number;
    /** 视频子系统在线状态 0离线，1在线 */
    videoOnline: number;
    /** 地图笛卡尔坐标 */
    coordinate: string;
    /** 航线角度 */
    positionAngle: number;
    /** GPS经度，有GPS模块才返回 */
    longitude?: number;
    /** GPS纬度，有GPS模块才返回 */
    latitude?: number;
    /** GPS海拔，有GPS模块才返回 */
    altitude?: number;
    /** 移动速度，米/秒 */
    speed: number;
    /** 环境温度 */
    temperature?: number;
    /** 环境湿度 */
    humidity?: number;
    /** 烟感传感器数值 */
    smoke?: number;
    /** PM2.5数值 */
    pm25?: number;
    /** 二氧化氮溶度PPM */
    ntrogenDioxide?: number;
    /** 臭氧gpb */
    ozone?: number;
    /** 粉尘ug/m3 */
    dust?: number;
    /** 大气压强/hpa */
    atmosphericPressure?: number;
    /** 风速m/s */
    windSpeed?: number;
    /** 风向，正北为0° */
    windDirection?: number;
    /** 配送箱信息 */
    box: IRobotBoxInfo;
    /** 0未到点，1到点，点位到达标记 */
    emergency_task_status: number;
}

/**
 * 2.1.4 查询机器人实时状态接口返回
 * @remark 轮询建议间隔2S，机器人本身状态上报为2S一次，请求过快无意义
 */
export interface IGetRobotStatusResult extends ICommonResponse {
    module: 'walk';
    function: 'getRobotStatus';
    param: IGetRobotStatusResultParam;
}

// ====================== 2.1.14 开启自主导航 navigationStart ======================
/**
 * 开启自主导航入参
 */
export interface INavigationStartParam {
    /** 机器人ID */
    robotId: string;
}

/**
 * 2.1.14开启自主导航返回结果
 * @remark 开启后，如果存在定时巡逻任务，则机器人会自主执行；开关状态通过websocket状态上报naviSwitch字段推送
 */
export interface INavigationStartResult extends ICommonResponse {
    module: 'walk';
    function: 'navigationStart';
}

// ====================== 2.1.15 关闭自主导航 navigationStop ======================
/**
 * 关闭自主导航入参
 */
export interface INavigationStopParam {
    /** 机器人ID */
    robotId: string;
}

/**
 * 2.1.15关闭自主导航返回结果
 * @remark 关闭后机器人不会执行导航巡逻任务；开关状态通过websocket状态上报naviSwitch字段推送
 */
export interface INavigationStopResult extends ICommonResponse {
    module: 'walk';
    function: 'navigationStop';
}

// ====================== 2.1.16 位置矫正指令 correctPosition ======================
/**
 * 位置矫正指令入参
 * @remark 在地图上选择坐标点作为机器人的新位置，用于修正机器人定位
 */
export interface ICorrectPositionParam {
    /** 机器人ID */
    robotId: string;
    /** 地图Id，支持多层地图 */
    mapId: string;
    /** 点位X */
    positionX: string;
    /** 点位Y */
    positionY: string;
    /** 矫正完成后的航向角度 */
    positionAngle: string;
}

/**
 * 2.1.16位置矫正指令返回结果
 */
export interface ICorrectPositionResult extends ICommonResponse {
    module: 'walk';
    function: 'correctPosition';
}

// ====================== 2.1.17 开机位置初始化 initPosition ======================
/**
 * 开机位置初始化入参
 * @remark 机器人开机后初始化定位坐标
 */
export interface IInitPositionParam {
    /** 机器人ID */
    robotId: string;
    /** 地图ID */
    mapId: number;
    /** 坐标X */
    positionX: string;
    /** 坐标Y */
    positionY: string;
    /** 初始化角度 */
    positionAngle: string;
}

/**
 * 2.1.17开机位置初始化返回结果
 */
export interface IInitPositionResult extends ICommonResponse {
    module: 'walk';
    function: 'initPosition';
}

// ====================== 2.4.1 SOS告警指令下发 interactiveSOS ======================
/**
 * SOS告警指令下发入参
 */
export interface IInteractiveSOSParam {
    /** 机器人ID */
    robotId: string;
    /** 0关闭SOS告警，1开启SOS告警 */
    control: 0 | 1;
}

/**
 * 2.4.1 SOS告警指令下发返回结果
 */
export interface IInteractiveSOSResult extends ICommonResponse {
    module: 'interact';
    function: 'interactiveSOS';
}

// ====================== 2.4.2 实时喊话 realTimeCall ======================
/**
 * 实时喊话入参
 * @remark 接口实现TTS播放，前提机器人本体可访问互联网；content内容不能超过50字符
 */
export interface IRealTimeCallParam {
    /** 机器人ID */
    robotId: string;
    /** 不超过50字符，tts播报文本 */
    content: string;
}

/**
 * 2.4.2 实时喊话返回结果
 */
export interface IRealTimeCallResult extends ICommonResponse {
    module: 'interact';
    function: 'realTimeCall';
}

// ====================== 2.4.3 播放音频、视频、词条 mediaPlay ======================
/**
 * 媒体播放指令入参
 * @remark 视频播放仅支持带交互屏幕的设备
 */
export interface IMediaPlayParam {
    /** 机器人ID */
    robotId: string;
    /** 媒体唯一code，媒体新增接口返回 */
    mediaCode: string;
    /** 1视频 2音频 3词条 */
    mediaType: 1 | 2 | 3;
    /** 0播放一次，1循环播放，2停止播放 */
    playmode: 0 | 1 | 2;
}

/**
 * 2.4.3播放音频、视频、词条返回结果
 */
export interface IMediaPlayResult extends ICommonResponse {
    module: 'interact';
    function: 'mediaPlay';
}

// ====================== 2.5.1 获取摄像头视频url getCameraUrl ======================
/**
 * 获取摄像头视频流地址入参
 */
export interface IGetCameraUrlParam {
    /** 机器人ID */
    robotId: string;
}

/**
 * 获取摄像头视频url 返回param对象
 * @remark 返回http协议以及rtmp协议两种播放地址，视频携带音频会一并返回
 */
export interface IGetCameraUrlResultParam {
    /** 前摄像头http url */
    frontUrl: string;
    /** 后摄像头http url */
    backUrl: string;
    /** 左摄像头http url */
    leftUrl: string;
    /** 右摄像头http url */
    rightUrl: string;
    /** 红外摄像头http url */
    infraredUrl: string;
    /** 前摄像头rtmp url */
    frontRtmp: string;
    /** 后摄像头rtmp url */
    backRtmp: string;
    /** 左摄像头rtmp url */
    leftRtmp: string;
    /** 右摄像头rtmp url */
    rightRtmp: string;
    /** 红外摄像头rtmp url */
    infraredRtmp: string;
}

/**
 * 2.5.1 获取摄像头视频url接口返回
 */
export interface IGetCameraUrlResult extends ICommonResponse {
    module: 'video';
    function: 'getCameraUrl';
    param: IGetCameraUrlResultParam;
}

// ====================== 4.11 警示灯光开关 robot/light ======================
/**
 * 警示灯光开关入参
 * @remark 该接口为格式2接口，请求方式与/apiRequest不一样，key放置header，不是body
 */
export interface IRobotLightParam {
    /** 机器人ID */
    robotId: string;
    /** 1开启警示灯，0关闭警示灯 */
    light: number;
}

/**
 * 4.11 警示灯光开关返回结果
 * @remark 4.11接口是格式2接口，返回格式 {code:0,message:string}
 */
export interface IRobotLightResult {
    /** 0 表示成功 */
    code: number;
    message: string;
}

// ================= 原有接口保留参考 =================
/**
 * 单点导航位置参数
 */
export interface ISinglePointNavPosition {
    /** 点位X */
    positionX: string;
    /** 点位Y */
    positionY: string;
    /** 到点之后的角度。到达点位后，转动角度 */
    positionAngle: string;
}

/**
 * 单点导航接口返回结果
 */
export interface ISinglePointNavResult extends ICommonResponse {
    module: 'walk';
    function: 'singlePointNav';
}
