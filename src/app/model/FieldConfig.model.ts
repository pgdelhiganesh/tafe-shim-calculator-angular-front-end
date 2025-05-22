
export interface FieldConfig {
    Action: string;
    Display_Name: string;
    Place_Holder: string;
    Variable_Name: string;
    Data_Type: string;
    Min_Value?: any;
    Max_Value?: any;
    Min_Length?: any;
    Max_Length?: any;
    Options?: string[] | null;
    Default_Value?: any;
    Required: boolean;
    Editable: boolean;
    Expression?: string | null;
}
