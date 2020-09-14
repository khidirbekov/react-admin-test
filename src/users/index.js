import * as React from "react";
import { List, Datagrid, Edit, Create, SimpleForm, DateField, TextField, EditButton, TextInput, DateInput } from 'react-admin';
import BookIcon from '@material-ui/icons/Book';
export const PostIcon = BookIcon;

export const UsersList = (props) => { 
  console.log(props)

    return (<List {...props}>
        <Datagrid>
            <TextField source="id" />
            <TextField source="email" />
            <DateField source="phone" />
            <TextField source="fullName" />
            <EditButton basePath="/users" />
        </Datagrid>
    </List>
);
}


export const UsersEdit = (props) => (
    <Edit title='Юзеры' {...props}>
        <SimpleForm>
            <TextInput disabled source="id" />
            <TextInput source="email" />
            <TextInput source="phone" />
            <TextInput source="fullName" />
        </SimpleForm>
    </Edit>
);

export const UsersCreate = (props) => (
    <Create title="Create a Post" {...props}>
        <SimpleForm>
            <TextInput source="email" />
            <TextInput source="phone" />
            <TextInput source="fullName" />
        </SimpleForm>
    </Create>
);
