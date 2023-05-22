# Pulumi Stack Outputs

This GitHub Action reads the outputs of a Pulumi stack from an S3 state backend and sets them as outputs of the GitHub Action.

## Inputs

- `stack` (required): The name of the Pulumi stack to read.
- `output` (required): The name of the output to set as the output of the GitHub Action.
- `cloud-url` (required): The S3 URL of the Pulumi stack checkpoint file.

## Outputs

- The value of the specified output from the Pulumi stack. The name of the stack's output will be the name of the output.

## Example usage

```yaml
- name: Read Pulumi stack outputs
  id: pulumi-outputs
  uses: rs21io/pulumi-stack-outputs@main
  with:
    stack: my-stack
    output: my-output
    cloud-url: s3://my-bucket/my-prefix
```

In this example, we're using the `rs21io/pulumi-stack-outputs` GitHub Action to read the `my-output` output from the `my-stack` Pulumi stack stored in the `s3://my-bucket/my-prefix` S3 bucket which is the path to the S3 backend storing the stack's state. The value of the `my-output` output will be set as the output of the GitHub Action. E.g., `${{ steps.pulumi-outputs.my-outpt }}`