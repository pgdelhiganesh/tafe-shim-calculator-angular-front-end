import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldConfig } from './model/FieldConfig.model';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'shim_calculator';

  form!: FormGroup;
  fields: FieldConfig[] = []; // Will hold your JSON config

  ngOnInit() {
    this.fields = this.loadConfig(); // Replace with your actual JSON load
    this.buildForm();
  }

  loadConfig(): FieldConfig[] {
    // Paste the cleaned JSON from your message here
    return [
      {
        Action: "Input",
        Display_Name: "Enter the value X",
        Place_Holder: "Enter the value X",
        Variable_Name: "Xval",
        Data_Type: "double",
        Min_Value: 5.2,
        Max_Value: 50.005,
        Options: null,
        Default_Value: 10.4,
        Required: true,
        Editable: true,
        Expression: null
      },
      {
        Action: "Input",
        Display_Name: "Enter the value Y",
        Place_Holder: "Enter the value Y",
        Variable_Name: "Yval",
        Data_Type: "int",
        Min_Value: 1,
        Max_Value: 5,
        Min_Length: null,
        Max_Length: null,
        Options: null,
        Default_Value: null,
        Required: false,
        Editable: true,
        Expression: null
      },
      {
        Action: "Input",
        Display_Name: "Enter the value Z",
        Place_Holder: "Enter the value Z",
        Variable_Name: "Zval",
        Data_Type: "string",
        Min_Value: null,
        Max_Value: null,
        Min_Length: 1,
        Max_Length: 5,
        Options: null,
        Default_Value: "XYZ",
        Required: false,
        Editable: true,
        Expression: null
      },
      {
        Action: "Input",
        Display_Name: "Select the status",
        Place_Holder: "Select the status",
        Variable_Name: "Sval",
        Data_Type: "bool",
        Min_Value: null,
        Max_Value: null,
        Min_Length: null,
        Max_Length: null,
        Options: null,
        Default_Value: false,
        Required: false,
        Editable: true,
        Expression: null
      },
      {
        Action: "Input",
        Display_Name: "Select the date",
        Place_Holder: "Select the status",
        Variable_Name: "Dval",
        Data_Type: "datetime",
        Min_Value: "2024-01-01T00:00:00",
        Max_Value: "2025-12-31T23:59:59",
        Min_Length: null,
        Max_Length: null,
        Options: null,
        Default_Value: "2025-01-01T08:00:00",
        Required: false,
        Editable: true,
        Expression: null
      },
      {
        Action: "Input",
        Display_Name: "Select the enum",
        Place_Holder: "Select the enum",
        Variable_Name: "Eval",
        Data_Type: "enum",
        Min_Value: null,
        Max_Value: null,
        Min_Length: null,
        Max_Length: null,
        Options: ["Active", "Inactive", "Pending"],
        Default_Value: "Active",
        Required: false,
        Editable: true,
        Expression: null
      },
      
    ];

  }

  constructor(private fb: FormBuilder) { }

  buildForm() {
    const formGroup: any = {};
    this.fields.forEach(field => {
      if (field.Action === 'Input') {
        const validators = [];

        if (field.Required) validators.push(Validators.required);

        if (field.Data_Type === 'string') {
          if (field.Min_Length) validators.push(Validators.minLength(field.Min_Length));
          if (field.Max_Length) validators.push(Validators.maxLength(field.Max_Length));
        }

        if (field.Data_Type === 'int' || field.Data_Type === 'double') {
          if (field.Min_Value != null) validators.push(Validators.min(field.Min_Value));
          if (field.Max_Value != null) validators.push(Validators.max(field.Max_Value));
        }

        const control = new FormControl({ value: field.Default_Value ?? '', disabled: !field.Editable }, validators);
        formGroup[field.Variable_Name] = control;
      }
    });

    this.form = this.fb.group(formGroup);
  }

  onSubmit() {
    const rawValues = this.form.getRawValue();
    console.log('Form values:', rawValues);

    // Compute outputs (Rval, R2val)
    const Xval = parseFloat(rawValues.Xval);
    const Yval = parseInt(rawValues.Yval);
    const Zval = rawValues.Zval;

    const Rval = (Xval / 30) - Yval; // Can't add Zval (string) safely
    const R2val = Rval !== 0 ? (Xval + Yval) / Rval : 0;

    console.log('Rval:', Rval);
    console.log('R2val:', R2val);
  }
}
