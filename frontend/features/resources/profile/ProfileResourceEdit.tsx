"use client";

import { Edit, SimpleForm } from "react-admin";
import { ProfileFormFields } from "./ProfileFormFields";

export function ProfileResourceEdit() {
  return (
    <Edit>
      <SimpleForm><ProfileFormFields disableRole /></SimpleForm>
    </Edit>
  );
}

