export const CREATE_PAGE_SX = {
  "& .RaCreate-main": { maxWidth: "none" },
  "& .RaCreate-card": { maxWidth: "none", width: "100%" },
};

export const EDIT_PAGE_SX = {
  "& .RaEdit-main": { maxWidth: "none" },
  "& .RaEdit-card": { maxWidth: "none", width: "100%" },
};

export const FORM_SX = {
  maxWidth: "none",
  width: "100%",
  "& .RaSimpleForm-form": { maxWidth: "none", width: "100%" },
  "& .RaInput-root": { mt: 0, mb: 0, width: "100%" },
  "& .MuiFormControl-root": { width: "100%" },
};

export const MIL_FORM_SX = {
  ...FORM_SX,
  "& .RaToolbar-root": {
    borderTop: "2px solid #c41e3a",
    backgroundColor: "#fdf5f6",
    px: 2,
    py: 1.5,
    gap: 1,
  },
};

export const MIL_LIST_SX = {
  "& .RaList-main": { maxWidth: "none" },
  "& .MuiPaper-root": { border: "1px solid #e8c4ca", borderRadius: "2px" },
  "& .RaList-content": { overflow: "hidden" },
};
