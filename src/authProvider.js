import axios from 'axios'
const client_secret = '5efb9az2d1sss48sgkowsow0gowck0k0ko4kswccog440gcw8o'
const client_id = '3_1v7ugoq694tcow0s0w8csw0k8koo0s44swgg0w8s0kkkosgw8w'
const grant_type = 'password'

const authProvider = {
    login: ({ username, password }) =>  {
        const request = axios('http://gallery.dev.webant.ru/oauth/v2/token', {
            method: 'GET',
            params: { username, password, client_secret, client_id, grant_type },
            headers: new Headers({ 'Content-Type': 'application/json' }),
        }).then(response => {
            if (response.status < 200 || response.status >300) {
                throw new Error(response)
            }
            return response
        }).then(async( {data} ) => {
            localStorage.setItem('access_token', data.access_token)
            localStorage.setItem('refresh_token', data.refresh_token)
            await axios(`${process.env.REACT_APP_BASE_PATH}/api/users/current`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${data.access_token}` },
            }).then(( {data} ) => {
                localStorage.setItem('permissions', data.roles)
                if(data.roles.includes('ROLE_ADVISER')) {
                    Promise.resolve({ redirectTo: '/full_orders' })
                } else if(data.roles.includes('ROLE_MANAGER')) {
                    Promise.resolve({ redirectTo: '/companies' })
                } else {
                    Promise.resolve({ redirectTo: '/users' })
                }
            });
        });
        return request
    },
    checkAuth: () => localStorage.getItem('access_token')
        ? Promise.resolve()
        : Promise.reject(),
    checkError: error => Promise.resolve(),
    getPermissions: () => {
        const role = localStorage.getItem('permissions');
        return role ? Promise.resolve(role) : Promise.reject();
    },
    logout: () => {
        localStorage.clear()
        return Promise.resolve()
    },
};

export default authProvider;
