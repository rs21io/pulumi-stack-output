import * as core from '@actions/core'
import {S3Client, GetObjectCommand} from '@aws-sdk/client-s3'

export async function run(): Promise<void> {
  try {
    const stackName: string = core.getInput('stack')
    const outputName: string = core.getInput('output')
    let s3Uri: string = core.getInput('cloud-url')

    if (!s3Uri.endsWith('/')) s3Uri += '/'
    const bucket = s3Uri.split('/')[2]
    const prefix = s3Uri.split('/').slice(3).join('/')
    const key = `${prefix}.pulumi/stacks/${stackName}.json`

    const s3 = new S3Client({})
    const command = new GetObjectCommand({Bucket: bucket, Key: key})
    const response = await s3.send(command)
    const body = await response.Body?.transformToString()
    if (!body) {
      throw new Error(`Failed to read ${stackName} from ${s3Uri}`)
    }

    const state = JSON.parse(body)
    const latestKey = 'latest' in state.checkpoint ? 'latest' : 'Latest'
    const resources = state.checkpoint[latestKey].resources
    const stack = resources.find(
      (r: Record<string, string>) => r.type === 'pulumi:pulumi:Stack'
    )
    const output = stack.outputs[outputName]
    core.setOutput(outputName, output)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
