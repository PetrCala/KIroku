import {
  isStepIdentifierUsingName,
  isStepIdentifierUsingRun,
  type StepIdentifier,
} from '@kie/act-js/build/src/step-mocker/step-mocker.types';
import type {PathOrFileDescriptor} from 'fs';
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

// eslint-disable-next-line @typescript-eslint/naming-convention
type YamlMockJob = Omit<MockJob, 'runsOn'> & {'runs-on'?: string};

type YamlWorkflow = {
  jobs: Record<string, YamlMockJob>;
};

type MockJob = {
  steps: StepIdentifier[];
  uses?: string;
  secrets?: string[];
  with?: string;
  outputs?: Record<string, string>;
  runsOn: string;
};

type MockJobs = Record<string, MockJob>;

class JobMocker {
  workflowFile: string;

  cwd: string;

  constructor(workflowFile: string, cwd: string) {
    this.workflowFile = workflowFile;
    this.cwd = cwd;
  }

  mock(mockJobs: MockJobs = {}) {
    const filePath = this.getWorkflowPath();
    const workflow = this.readWorkflowFile(filePath);

    Object.entries(mockJobs).forEach(([jobId, mockJob]) => {
      const job = this.locateJob(workflow, jobId);
      if (job) {
        if (job.uses) {
          delete job.uses;
        }
        if (job.secrets) {
          delete job.secrets;
        }
        let jobWith: string | undefined;
        if (job.with) {
          jobWith = job.with;
          delete job.with;
        }

        // CUSTOM CODE FROM HERE
        job.steps = mockJob.steps.map((step): StepIdentifier => {
          // Initialize a base object for StepIdentifier.
          // You might need to adjust this base object depending on what properties are common and required.
          let mockStep: Partial<StepIdentifier> = {};

          // Use type guards to determine the type of step and set properties accordingly
          if (isStepIdentifierUsingName(step)) {
            mockStep = {name: step.name}; // Assuming step has a name property
          } else if (isStepIdentifierUsingRun(step)) {
            mockStep = {run: step.mockWith as any}; // Assuming step has a run property
          }

          // Setting `id` and `with`, assuming they are optional and should be added outside of the initial type guard checks.
          // This approach might need to be adjusted based on actual requirements and how these properties fit into the StepIdentifier types.
          if ('id' in step) {
            // Assuming your logic dictates that the original step might have an id property to be copied.
            (mockStep as any).id = step.id; // Use `any` or a more specific type if possible
          }
          if (jobWith && 'with' in mockStep) {
            // Assuming there's a logical condition where jobWith should be assigned.
            (mockStep as any).with = jobWith; // Use bracket notation if `with` is a problematic keyword
          }

          // TypeScript should now recognize `mockStep` as a valid StepIdentifier, but make sure to adjust logic for id and with properties as necessary.
          return mockStep as StepIdentifier;
        });
        // CUSTOM CODE ENDS HERE

        // Here is the original code that was replaced
        // job.steps = mockJob.steps.map((step): StepIdentifier => {
        //   const mockStep: StepIdentifier = {
        //     name: step.name,
        //     run: step.mockWith,
        //   };
        //   if (step.id) {
        //     mockStep.id = step.id;
        //   }
        //   if (jobWith) {
        //     mockStep.with = jobWith;
        //   }
        //   return mockStep;
        // });
        if (mockJob.outputs) {
          job.outputs = mockJob.outputs;
        }
        if (mockJob.runsOn) {
          job['runs-on'] = mockJob.runsOn;
        }
      } else {
        throw new Error('Could not find job');
      }
    });
    return this.writeWorkflowFile(filePath, workflow);
  }

  locateJob(workflow: YamlWorkflow, jobId: string): YamlMockJob {
    return workflow.jobs[jobId];
  }

  getWorkflowPath(): string {
    if (fs.existsSync(path.join(this.cwd, this.workflowFile))) {
      return path.join(this.cwd, this.workflowFile);
    }
    if (this.cwd.endsWith('.github')) {
      return path.join(this.cwd, 'workflows', this.workflowFile);
    }
    if (
      fs.existsSync(
        path.join(this.cwd, '.github', 'workflows', this.workflowFile),
      )
    ) {
      return path.join(this.cwd, '.github', 'workflows', this.workflowFile);
    }
    throw new Error(`Could not locate ${this.workflowFile}`);
  }

  readWorkflowFile(location: PathOrFileDescriptor): YamlWorkflow {
    const test: YamlWorkflow = yaml.parse(fs.readFileSync(location, 'utf8'));

    return test;
  }

  writeWorkflowFile(location: PathOrFileDescriptor, data: YamlWorkflow) {
    return fs.writeFileSync(location, yaml.stringify(data), 'utf8');
  }
}

export default JobMocker;
export type {MockJob, MockJobs, YamlWorkflow, YamlMockJob};
