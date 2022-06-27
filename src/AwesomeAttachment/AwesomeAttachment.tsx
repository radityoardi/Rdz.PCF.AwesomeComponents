import React from 'react';
import * as Fluent from '@fluentui/react';
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import Dropzone, { FileRejection } from 'react-dropzone';
import { v4 as guid } from 'uuid';
import * as FluentIcon from '@fluentui/react-file-type-icons';

FluentIcon.initializeFileTypeIcons();

export interface IAwesomeAttachmentProps {
  name?: string;
  outputChanged?: (newOutputs: IOutputs) => void;
  context?: ComponentFramework.Context<IInputs>;
}

export interface IFile {
  ID: string;
  properties: File;
  preview: string;
}

export class AwesomeAttachment extends React.Component<IAwesomeAttachmentProps> {

  private App: React.FunctionComponent<IAwesomeAttachmentProps> = (props: IAwesomeAttachmentProps) => {
    const [files, setFiles] = React.useState<IFile[]>([]);
    const [deletedFiles, setDeletedFiles] = React.useState<IFile[]>([]);
    const [maxFiles, setMaxFiles] = React.useState<number>(props.context?.parameters.maxFileCount.raw!);
    const [csvPreviewExtensions, setCsvPreviewExtensions] = React.useState<string>(props.context?.parameters.extensionsPreview.raw!);

    const fileExtension = (filename: string) => {
      const lastIndexOfDot = filename.lastIndexOf(`.`);
      if (lastIndexOfDot > -1) {
        return filename.substring(lastIndexOfDot + 1).toLowerCase();
      } else {
        return ``;
      }
    };

    const deleteFile = (selectedFile: IFile) => {
      const splicedFiles = [...files];
      URL.revokeObjectURL(selectedFile.preview);
      const deletedFiles = splicedFiles.splice(files.indexOf(selectedFile), 1);
      setDeletedFiles(current => [...current, ...deletedFiles]);
      setFiles(splicedFiles);
    };

    const deleteAllFiles = () => {
      files.map(file => {
        URL.revokeObjectURL(file.preview);
      });
      setFiles([]);
    };

    const renderImage = (currentFile: IFile, extension: string) => {
      if (csvPreviewExtensions.indexOf(extension) > -1) {
        return (<Fluent.Image height={64} src={currentFile.preview} imageFit={Fluent.ImageFit.centerCover} />);
      } else {
        return (<Fluent.Icon {...FluentIcon.getFileTypeIconProps({ extension: extension, size: 64 })} />);
      }
    };

    const onDrop = (acceptedFiles:File[], rejectedFiles:FileRejection[]) => {
      if (maxFiles === undefined || (maxFiles && files.length <= maxFiles)) {
        const remainingSlots = maxFiles === undefined ? undefined : maxFiles - files.length;
        const finalAcceptedFiles = remainingSlots === undefined ? acceptedFiles : acceptedFiles.slice(0, remainingSlots);
        console.log(finalAcceptedFiles);
        setFiles(current => [...current, ...finalAcceptedFiles.map((acceptedFile:File) => {
          return {
            ID: guid(),
            properties: acceptedFile,
            preview: URL.createObjectURL(acceptedFile)
          } as IFile;
        })]);
      }
    };

    React.useEffect(() => {
      if (files && files.length > 0) {
        setFiles(files.map(file => {
          return { ...file, preview: URL.createObjectURL(file.properties) } as IFile;
        }));
      }
    }, []);

    React.useEffect(() => {
      setMaxFiles(props.context?.parameters.maxFileCount.raw!);
    },[props.context?.parameters.maxFileCount.raw!]);

    React.useEffect(() => {
      setCsvPreviewExtensions(props.context?.parameters.extensionsPreview.raw!);
    },[props.context?.parameters.extensionsPreview.raw!]);

    return (
      <React.Fragment>
        <Fluent.Stack tokens={{ childrenGap: 10 }}>
          <Dropzone maxFiles={maxFiles > 0 ? maxFiles : undefined} onDrop={onDrop.bind(this)}>
            {
              ({ getRootProps, getInputProps }) => (
                <section>
                  <div {...getRootProps()} className={`awesomeattachment-dropzone`}>
                    <Fluent.Stack>
                      <input {...getInputProps()} />
                      <Fluent.Text variant='mediumPlus' nowrap>
                        {props.context && props.context.parameters.dragDropPlaceholderTexts.raw!}
                      </Fluent.Text>
                      {
                        maxFiles > 0 && (<Fluent.Text variant='smallPlus' nowrap>(up to {maxFiles} file{maxFiles > 1 ? `s` : ``})</Fluent.Text>)
                      }
                    </Fluent.Stack>
                  </div>
                </section>
              )
            }
          </Dropzone>
          <Fluent.Stack horizontal>
            <Fluent.ActionButton iconProps={ { iconName: "Delete" } } text="Clear everything" onClick={deleteAllFiles.bind(this)} disabled={ files.length === 0 } />
          </Fluent.Stack>
          <Fluent.Stack tokens={{ childrenGap: 10 }} className={`awesomeattachment-dropzone-files`} horizontal wrap>
            {
              (files === undefined || files.length === 0) && props.context && (
                <Fluent.Stack tokens={ { padding: 20 } }>
                  <Fluent.Text variant='small' nowrap key={`nofiletext-${guid()}`}>
                    { props.context.parameters.noFileTexts.raw! }
                  </Fluent.Text>
                </Fluent.Stack>
              )
            }
            {
              files && files.length > 0 && files.map((file, index) => {
                const extension = fileExtension(file.properties.name);
                return (
                  <Fluent.StackItem tokens={{ padding: 10 }} key={`file-${file.ID}`} className={`awesomeattachment-dropzone-file`}>
                    {
                      renderImage(file, extension)
                    }
                    <Fluent.Text variant='smallPlus' nowrap block>
                      {file.properties.name}
                    </Fluent.Text>
                    <Fluent.IconButton iconProps={{ iconName: 'Delete' }} onClick={deleteFile.bind(this, file)} />
                  </Fluent.StackItem>
                );
              })
            }
          </Fluent.Stack>
        </Fluent.Stack>
      </React.Fragment>
    );
  }

  public render(): React.ReactNode {
    return (
      <this.App {...this.props} />
    )
  }
}
