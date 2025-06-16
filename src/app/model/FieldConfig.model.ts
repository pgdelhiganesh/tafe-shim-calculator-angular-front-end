
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
    Title:any
}



// ================= Interface Setup =================
interface Validation {
  Editable: boolean;
  Required: boolean;
  MinValue: number | null;
  MaxValue: number | null;
  MinLength: number | null;
  MaxLength: number | null;
}

interface Rule {
  RuleName: string;
  Expression: string;
  SuccessEvent: any;
}

interface Parameter {
  ParameterType: 'Input' | 'Output';
  DisplayName: string;
  VariableName: string;
  DataType: string;
  DefaultValue: any;
  ResultValue: any;
  Expression: string | null;
  Validation: Validation;
  Options: any[] | null;
  Rules: Rule[] | null;
}

interface Workflow {
  WorkflowName: string;
  Parameters: Parameter[];
}

interface WorkflowField {
  Title: string;
  SchemaVersion?: string;
  Workflows: Workflow[];
}

// ================= Component Code =================