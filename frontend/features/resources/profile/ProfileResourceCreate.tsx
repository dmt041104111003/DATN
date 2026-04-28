"use client";

import { Create, SimpleForm } from "react-admin";
import { ProfileFormFields } from "./ProfileFormFields";

export function ProfileResourceCreate(props: any) {
  const { defaultValues, ...rest } = props || {};
  return (
    <Create {...rest}>
      <SimpleForm defaultValues={defaultValues}><ProfileFormFields /></SimpleForm>
    </Create>
  );
}

