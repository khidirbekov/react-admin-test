import * as React from "react";
import { render } from 'react-dom';
import { Admin, Resource } from 'react-admin';

import { UsersList, UsersEdit, UsersCreate } from './users';
import authProvider from "./authProvider";
import jsonServerProvider from "./dataProvider"

const dataProvider = jsonServerProvider(
  `http://cors-anywhere.herokuapp.com/http://gallery.dev.webant.ru/api`
);


render(
    <Admin dataProvider={dataProvider} 
      authProvider={authProvider}
    >
        <Resource name="users" list={UsersList} edit={UsersEdit} create={UsersCreate}/>
    </Admin>,
    document.getElementById('root')
);