import { stringify } from "query-string";
import { fetchUtils } from "ra-core";
import axios from "axios";
/**
 * Maps react-admin queries to a json-server powered REST API
 *
 * @see https://github.com/typicode/json-server
 *
 * @example
 *
 * getList          => GET http://my.api.url/posts?_sort=title&_order=ASC&_start=0&_end=24
 * getOne           => GET http://my.api.url/posts/123
 * getManyReference => GET http://my.api.url/posts?author_id=345
 * getMany          => GET http://my.api.url/posts/123, GET http://my.api.url/posts/456, GET http://my.api.url/posts/789
 * create           => POST http://my.api.url/posts/123
 * update           => PUT http://my.api.url/posts/123
 * updateMany       => PUT http://my.api.url/posts/123, PUT http://my.api.url/posts/456, PUT http://my.api.url/posts/789
 * delete           => DELETE http://my.api.url/posts/123
 *
  */
const instance = axios.create({
  headers: {'Content-type': 'application/json'}
});
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      if (
        error.response.config.url ===
        `${process.env.REACT_APP_BASE_PATH}/oauth/v2/token`
      ) {
        localStorage.clear()
        window.location.replace("./login");
      }

      originalRequest._retry = true;

      return new Promise((resolve, reject) => {
        if (!localStorage.getItem("refresh_token")) {
          localStorage.clear()
          window.location.replace("./login");
          return;
        } else {
          axios({
            url: `${process.env.REACT_APP_BASE_PATH}/oauth/v2/token`,
            method: "get",
            params: {
              client_id: process.env.REACT_APP_CLIENT_ID,
              client_secret: process.env.REACT_APP_CLIENT_SECRET,
              refresh_token: localStorage.getItem("refresh_token"),
              grant_type: "refresh_token",
            },
          })
            .then(({ data }) => {
              localStorage.setItem("access_token", data.access_token);
              localStorage.setItem("refresh_token", data.refresh_token);

              error.config.headers[
                "Authorization"
              ] = `Bearer ${data.access_token}`;
              instance.defaults.headers.common[
                "Authorization"
              ] = `Bearer ${data.access_token}`;
              originalRequest.headers[
                "Authorization"
              ] = `Bearer ${data.access_token}`;

              resolve(instance(originalRequest));
            })
            .catch((er) => {
              localStorage.clear()
              window.location.replace("./login");
              reject(er);
            });
        }
      });
    }

    return Promise.reject(error);
  }
);

export default (apiUrl) => ({
  getList: (resource, params) => {
    console.log(params);
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = {
      ...fetchUtils.flattenObject(params.filter),
      page: page,
      limit: perPage,
    };
    const url = `${apiUrl}/${resource}?${stringify(query)}`;
    return instance(url).then(({ data }) => {
      return {
        data: data.data,
        total: data.totalItems,
      };
    });
  },

  getOne: (resource, params) =>
    instance(`${apiUrl}/${resource}/${params.id}`).then(({ data }) => ({
      data: data,
    })),

  getMany: async (resource, params) => {
    console.log(params.ids)
    const query = {
      id: params.ids.map(item => item.id),
    };
    const test = []
    params.ids.forEach(el => {
      test.push({id: el.id})
    })
    const url = `${apiUrl}/${resource}`;
    return await instance(url, {params: query}).then(({ data }) => ({ data: data.items }));
    // console.log(params)
    // if(params.ids[0].id) {
    //   params.ids.forEach(async item => {
    //     const url = `${apiUrl}/${resource}/${item.id}`;
    //     return await instance(url).then(({ data }) => ({ data: data }));
    //   })
    // } else {
    //   params.ids.forEach(async id => {
    //     const url = `${apiUrl}/${resource}/${id}`;
    //     return await instance(url).then(({ data }) => ({ data: data }));
    //   })
    // }
    
  },

  getManyReference: (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = {
      ...fetchUtils.flattenObject(params.filter),
      page: page,
      limit: perPage,
    };
    const url = `${apiUrl}/${resource}?${stringify(query)}`;

    return instance(url).then(({ data }) => {
      return {
        data: data,
        total: data.totalItems,
      };
    });
  },

  update: async(resource, params) => {
    // if(params.data.photo) {
    //   if(params.data.photo.path.rawFile) {
    //     let formData = new FormData()
    //     formData.append('file', params.data.photo.path.rawFile)
    //     const response = await instance.post(`${apiUrl}/files`, formData);
    //     params.data.photo = `/api/files/${response.data.id}`
    //   } else {
    //     params.data.photo = `/api/files/${params.data.photo.id}`
    //   }
    // }
    // if(params.data.signature) {
    //   if(params.data.signature.path.rawFile) {
    //     let formData = new FormData()
    //     formData.append('file', params.data.signature.path.rawFile)
    //     const response = await instance.post(`${apiUrl}/files`, formData);
    //     params.data.signature = `/api/files/${response.data.id}`
    //   } else {
    //     params.data.signature = `/api/files/${params.data.signature.id}`
    //   }
    // }
    // if(params.data.dealerShip) {
    //   params.data.dealerShip = `/api/dealer_ships/${params.data.dealerShip.id}`
    // }
    // if(params.data.company) {
    //   params.data.company = `/api/companies/${params.data.company.id}`
    // }
    console.log(params)
    if (resource === "users" && params.data.passwordField) {
      await instance(`${apiUrl}/${resource}/updatepass`, {
        method: "POST",
        data: {
          newPassword: params.data.passwordField,
          userId: params.id,
        },
      });
    }
    return instance(`${apiUrl}/${resource}/${params.id}`, {
      method: "PUT",
      data: params.data,
    }).then(({ data }) => ({ data: data }))
  },
  // json-server doesn't handle filters on UPDATE route, so we fallback to calling UPDATE n times instead
  updateMany: (resource, params) =>
    Promise.all(
      params.ids.map((id) =>
        instance(`${apiUrl}/${resource}/${id}`, {
          method: "PUT",
          data: params.data,
        })
      )
    ).then((responses) => ({ data: responses.map(({ data }) => data.id) })),

  create: async (resource, params) => {
    if(params.data.photo) {
      if(params.data.photo.path.rawFile) {
        let formData = new FormData()
        formData.append('file', params.data.photo.path.rawFile)
        const response = await instance.post(`${apiUrl}/files`, formData);
        params.data.photo = `/api/files/${response.data.id}`
      } else {
        params.data.photo = `/api/files/${params.data.photo.id}`
      }
    }
    if(params.data.signature) {
      if(params.data.signature.path.rawFile) {
        let formData = new FormData()
        formData.append('file', params.data.signature.path.rawFile)
        const response = await instance.post(`${apiUrl}/files`, formData);
        params.data.signature = `/api/files/${response.data.id}`
      } else {
        params.data.signature = `/api/files/${params.data.signature.id}`
      }
    }
    if(params.data.dealerShip) {
      params.data.dealerShip = `/api/dealer_ships/${params.data.dealerShip.id}`
    }
    if(params.data.company) {
      params.data.company = `/api/companies/${params.data.company.id}`
    }
    return instance(`${apiUrl}/${resource}`, {
      method: "POST",
      data: params.data,
    }).then(({ data }) => ({
      data: { ...params.data, id: data.id },
    }))},
    
  delete: (resource, params) =>
    instance(`${apiUrl}/${resource}/${params.id}`, {
      method: "DELETE",
    }).then(({ data }) => ({ data: data })),

  // json-server doesn't handle filters on DELETE route, so we fallback to calling DELETE n times instead
  deleteMany: (resource, params) =>
    Promise.all(
      params.ids.map((id) =>
        instance(`${apiUrl}/${resource}/${id}`, {
          method: "DELETE",
        })
      )
    ).then((responses) => ({ data: responses.map(({ data }) => data.id) })),
  customUpdate: (resource, params) => {
        return instance(`${apiUrl}/${resource}/${params.id}`, {
          method: 'PUT',
          // data: params.data,
        }).then(({ data }) => ({ data: data}))
      }
});

const formatQuery = (query) => {
  console.log(query)
  query.id.map(item => item.id)
  console.log(query)
  return query.id.id
} 
