import * as core from '@actions/core'
import {S3Client, GetObjectCommand} from '@aws-sdk/client-s3'
import {run} from '../src/main'

jest.mock('@actions/core')
jest.mock('@aws-sdk/client-s3')

describe('run', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should read the stack outputs from S3', async () => {
    // Arrange
    const getInputMock = jest
      .spyOn(core, 'getInput')
      .mockImplementation((name: string) => {
        if (name === 'cloud-url') {
          return 's3://my-bucket/my-prefix'
        } else if (name === 'output') {
          return 'my-output'
        } else if (name === 'stack') {
          return 'my-stack'
        }
        return ''
      })

    const getObjectMock = jest.fn().mockResolvedValue({
      Body: Buffer.from(
        JSON.stringify({
          checkpoint: {
            Latest: {
              resources: [
                {
                  type: 'pulumi:pulumi:Stack',
                  outputs: {
                    'my-output': 'my-value'
                  }
                }
              ]
            }
          }
        })
      )
    })
    ;(S3Client as jest.Mock).mockImplementation(() => ({
      send: getObjectMock
    }))

    // Act
    await run()

    // Assert
    expect(getInputMock).toHaveBeenCalledWith('cloud-url')
    expect(getInputMock).toHaveBeenCalledWith('output')
    expect(getInputMock).toHaveBeenCalledWith('stack')
    expect(GetObjectCommand).toHaveBeenCalledWith({
      Bucket: 'my-bucket',
      Key: 'my-prefix/.pulumi/stacks/my-stack.json'
    })
    expect(getObjectMock).toHaveBeenCalled()
    expect(core.setOutput).toHaveBeenCalledWith('my-output', 'my-value')
  })

  // should fail if body is empty
  it('should fail if body is empty', async () => {
    // Arrange
    const getInputMock = jest
      .spyOn(core, 'getInput')
      .mockImplementation((name: string) => {
        if (name === 'cloud-url') {
          return 's3://my-bucket/my-prefix'
        } else if (name === 'output') {
          return 'my-output'
        } else if (name === 'stack') {
          return 'my-stack'
        }
        return ''
      })

    const getObjectMock = jest.fn().mockResolvedValue({
      Body: undefined
    })
    ;(S3Client as jest.Mock).mockImplementation(() => ({
      send: getObjectMock
    }))

    // Act
    await run()

    // Assert
    expect(getInputMock).toHaveBeenCalledWith('cloud-url')
    expect(getInputMock).toHaveBeenCalledWith('output')
    expect(getInputMock).toHaveBeenCalledWith('stack')
    expect(GetObjectCommand).toHaveBeenCalledWith({
      Bucket: 'my-bucket',
      Key: 'my-prefix/.pulumi/stacks/my-stack.json'
    })
    expect(getObjectMock).toHaveBeenCalled()
    expect(core.setFailed).toHaveBeenCalledWith(
      'Failed to read my-stack from s3://my-bucket/my-prefix/'
    )
  })

  it('should throw an error if required inputs are missing', async () => {
    // Arrange
    const getInputMock = jest
      .spyOn(core, 'getInput')
      .mockImplementation((name: string) => {
        return ''
      })

    // Act
    await run()

    // Assert
    expect(getInputMock).toHaveBeenCalledWith('cloud-url')
    expect(getInputMock).toHaveBeenCalledWith('output')
    expect(getInputMock).toHaveBeenCalledWith('stack')
  })
})
