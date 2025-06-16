import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
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
  title = 'shim_calculator';

  fields: any[] = [];                    // Complete JSON array
  arrayData: any;                        // Selected item’s object
  formMap: Record<string, FormGroup> = {};  // Map of WorkflowName → FormGroup
  selectedForm!: FormGroup  // Selected form group

  constructor(private fb: FormBuilder, private service: ApiService) { }

  ngOnInit() {
    this.getAllWorkflow();
  }

  getAllWorkflow() {
    this.service.get().subscribe((res: any) => {
      this.fields = res || [];

      console.log(this.fields);

      this.buildAllForms();
    });
  }

  getWorkFlow(title: string) {
    this.arrayData = this.fields.find((x: any) => x.Title === title);

    const workflowName = this.arrayData?.Workflows?.[0]?.WorkflowName;
    this.selectedForm = this.formMap[workflowName] || this.fb.group({});
    console.log(this.selectedForm, 'this.selectedForm');

  }

  buildAllForms() {
    this.formMap = {}; // reset

    for (const field of this.fields || []) {
      for (const workflow of field?.Workflows || []) {
        const formGroup: Record<string, FormControl> = {};
        const parameters = workflow.Parameters || [];

        for (const param of parameters) {
          if (param.ParameterType === 'Input') {
            const validation = param.Validation || {};
            const validators = [];

            if (validation.Required) validators.push(Validators.required);

            if (param.DataType === 'String') {
              if (validation.MinLength) validators.push(Validators.minLength(validation.MinLength));
              if (validation.MaxLength) validators.push(Validators.maxLength(validation.MaxLength));
            }

            if (['Int', 'Double'].includes(param.DataType)) {
              if (validation.MinValue != null) validators.push(Validators.min(validation.MinValue));
              if (validation.MaxValue != null) validators.push(Validators.max(validation.MaxValue));
            }

            formGroup[param.VariableName] = new FormControl(
              { value: param.DefaultValue ?? '', disabled: validation.Editable === false },
              validators
            );
          }
        }

        this.formMap[workflow.WorkflowName] = this.fb.group(formGroup);
      }
    }
  }


  SaveForm() {
    let allFormsValid = true;

    // Mark all fields as touched to show validation
    for (const form of Object.values(this.formMap)) {
      form.markAllAsTouched();
      if (form.invalid) {
        allFormsValid = false;
      }
    }

    // if (!allFormsValid) {
    //   console.warn('⚠️ Validation failed. Fix all errors.');
    //   return;
    // }

    // Deep clone arrayData to avoid mutating original
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

    this.service.post(dataToSend).subscribe({
      next: (res) => {
        alert('✅ Successfully sent');
        this.getAllWorkflow()
        console.log('✅ Successfully sent', res);
      },
      error: (err) => {
        alert('❌ Failed to send')

        console.error('❌ Failed to send:', err);
      }
    });
  }

}
