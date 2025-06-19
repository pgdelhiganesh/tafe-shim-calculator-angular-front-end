import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from './services/api.service';
import { log } from 'node:console';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  public title = 'shim_calculator';

  public fields: any[] = [];                    // Complete JSON array
  public arrayData: any;                        // Selected item’s object
  public formMap: Record<string, FormGroup> = {};  // Map of WorkflowName → FormGroup
  public selectedForm!: FormGroup  // Selected form group
  public currentCalTitle: any;
  EvaluationMessage: any;

  constructor(private fb: FormBuilder, private service: ApiService) { }

  ngOnInit() {
    this.getAllWorkflow();
  }

  getAllWorkflow() {
    this.service.get().subscribe((res: any) => {
      this.fields = res || [];
      console.log('✅ All workflows loaded:', this.fields);

      // ❌ Do NOT call buildForms here
    });
  }

  IsShow = false;
  backButton() {
    this.IsShow = false
  }

  resetForm(){
    this.selectedForm.reset();
  }

  getWorkFlow(title: string) {
    this.IsShow = true;
    this.currentCalTitle = title
    this.arrayData = this.fields.find((x: any) => x.Title === title);

    if (!this.arrayData) {
      console.error('❌ arrayData not found for title:', title);
      return;
    }

    // Build forms after arrayData is selected
    this.buildForms();

    const workflowName = this.arrayData?.Workflows?.[0]?.WorkflowName;
    this.selectedForm = this.formMap[workflowName] || this.fb.group({});

    console.log('✅ Selected Form:', this.selectedForm);
  }


  buildForms() {
    this.arrayData.Workflows.forEach((workflow: any) => {
      const group: { [key: string]: FormControl } = {};

      workflow.Parameters.forEach((field: any) => {
        const isOutput = field.ParameterType === 'Output';

        group[field.VariableName] = new FormControl(
          {
            value: field.DefaultValue ?? '',
            disabled: isOutput || field.Validation?.Editable === false
          },
          isOutput ? [] : this.getValidators(field)
        );
      });

      this.formMap[workflow.WorkflowName] = this.fb.group(group);
    });
  }

  getValidators(field: any): ValidatorFn[] {
    const validators: ValidatorFn[] = [];

    if (field.Validation?.Required) validators.push(Validators.required);
    if (field.Validation?.MinValue != null) validators.push(Validators.min(field.Validation.MinValue));
    if (field.Validation?.MaxValue != null) validators.push(Validators.max(field.Validation.MaxValue));
    if (field.Validation?.MinLength != null) validators.push(Validators.minLength(field.Validation.MinLength));
    if (field.Validation?.MaxLength != null) validators.push(Validators.maxLength(field.Validation.MaxLength));

    return validators;
  }


  getOutputField(parameters: Parameter[], inputVarName: string): Parameter | undefined {
    // Example mapping: var_A1 -> var_X1
    const outputName = inputVarName.replace('A', 'X');
    return parameters.find(p => p.ParameterType === 'Output' && p.VariableName === outputName);
  }

  SaveForm() {
    let allFormsValid = true;

    for (const form of Object.values(this.formMap) as FormGroup[]) {
      form.markAllAsTouched();
      if (form.invalid) {
        allFormsValid = false;
      }
    }

    const dataToSend = JSON.parse(JSON.stringify(this.arrayData));

    for (const workflow of dataToSend.Workflows) {
      const form = this.formMap[workflow.WorkflowName];
      const formValues = form.getRawValue();

      for (const param of workflow.Parameters) {
        if (param.ParameterType === 'Input') {
          param.ResultValue = formValues[param.VariableName];
        }
      }
    }

    console.log('📦 Final payload to send:', dataToSend);

    if (this.selectedForm.valid) {
      this.service.post(dataToSend).subscribe({
        next: (res: any) => {
          this.EvaluationMessage = res.EvaluationMessage
          console.log('✅ Response:', res);

          // ✅ Loop through all workflows in the response
          for (const updatedWorkflow of res.Workflows) {
            const form = this.formMap[updatedWorkflow.WorkflowName];

            updatedWorkflow.Parameters.forEach((param: any) => {
              if (param.ParameterType === 'Output') {
                const ctrl = form.get(param.VariableName);
                if (ctrl) {
                  ctrl.setValue(param.ResultValue);
                }
              }
            });
          }
        },
        error: (err) => {
          alert('❌ Failed to send');
          console.error('❌ Failed to send:', err);
        }
      });
    }
  }


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