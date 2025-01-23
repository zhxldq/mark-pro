import { get } from '@/http/request';

// 角色列表接口
export const getRoleList = async () => {
    return get({}, '/getRoleList');
};
