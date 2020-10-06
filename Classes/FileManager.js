const fs = require("fs").promises,
    path = require("path"),
    Console = require("./LogsManager"),
    decompress = require("decompress");

module.exports = class FileManager {
    /*----------------Attributes------------*/
    static Path = "../files";

    /*------------------Methods-------------*/
    static ReadFile(Path) {
        return fs.readFile(
            path.join(__dirname, FileManager.Path, Path),
            "utf-8"
        );
    }

    static WriteFile(Path, data) {
        return fs.writeFile(
            path.join(__dirname, FileManager.Path, Path),
            data,
            "utf-8"
        );
    }

    static async UploadFile(Path, File) {
        return fs
            .readFile(File.path)
            .then((data) => {
                return fs
                    .writeFile(
                        path.join(__dirname, FileManager.Path, Path, File.name),
                        data,
                        { flag: "wx" }
                    )
                    .catch(() => {
                        let extension = path.extname(File.name);
                        File.name =
                            path.basename(File.name, extension) +
                            new Date().getTime() +
                            extension;
                        return fs.writeFile(
                            path.join(
                                __dirname,
                                FileManager.Path,
                                Path,
                                File.name
                            ),
                            data
                        );
                    });
            })
            .then(() => {
                Console.log({
                    name: "Uploading File",
                    message: Path + " has been Uploaded",
                    code: "CMS_FILE_MANAGER",
                });
                return [200, File.name];
            })
            .catch((reason) => {
                Console.error(reason, "Uploading File");
                return [400, File.name + " " + reason.message];
            });
    }

    static UploadFiles(multiple, Path, Files, callback) {
        fs.readdir(path.join(__dirname, FileManager.Path, Path))
            .catch(() =>
                FileManager.CreateFolder(
                    path.dirname(Path),
                    path.basename(Path)
                )
            )
            .then(() => {
                if (multiple) {
                    let promises = [];
                    Files.forEach((file) => {
                        promises.push(FileManager.UploadFile(Path, file));
                    });
                    Promise.all(promises)
                        .then((data) => {
                            callback(200, data);
                        })
                        .catch((reason) => {
                            Console.error(reason, "Uploading File");
                            callback(400, reason);
                        });
                } else {
                    FileManager.UploadFile(Path, Files)
                        .then((result) => {
                            callback(result[0], result[1]);
                        })
                        .catch((reason) => {
                            Console.error(reason, "Uploading File");
                            callback(400, [Files.name, reason]);
                        });
                }
            });
    }

    static GetFileType(FileName) {
        let ext = path.extname(FileName).toLowerCase();
        switch (ext) {
            case ".swf":
                return {
                    type: "Flash",
                    icon: "fab fa-foursquare",
                    extension: ext,
                };
            //audio
            case ".aif":
            case ".cda":
            case ".mid":
            case ".midi":
            case ".mp3":
            case ".mpa":
            case ".ogg":
            case ".wav":
            case ".wma":
            case ".wpl":
                return {
                    type: "Audio",
                    icon: "fas fa-file-audio",
                    extension: ext,
                };
            //Compressed
            case ".7z":
            case ".arj":
            case ".deb":
            case ".pkg":
            case ".rar":
            case ".rpm":
            case ".gz":
            case ".z":
            case ".zip":
                return {
                    type: "Compressed",
                    icon: "fas fa-file-archive",
                    extension: ext,
                };
            //Disc and media file
            case ".bin":
            case ".dmg":
            case ".iso":
            case ".toast":
            case ".vcd":
                return {
                    type: "Disc",
                    icon: "fas fa-compact-disc",
                    extension: ext,
                };
            //Data and database
            case ".csv":
            case ".dat":
            case ".db":
            case ".dbf":
            case ".log":
            case ".mdb":
            case ".sav":
            case ".sql":
            case ".tar":
            case ".xml":
                return {
                    type: "Data",
                    icon: "fas fa-database",
                    extension: ext,
                };
            //Email
            case ".email":
            case ".eml":
            case ".emlx":
            case ".msg":
            case ".oft":
            case ".ost":
            case ".pst":
            case ".vcf":
                return {
                    type: "Email",
                    icon: "far fa-envelope",
                    extension: ext,
                };
            //Executable
            case ".bat":
            case ".com":
            case ".exe":
            case ".gadget":
            case ".msi":
            case ".wsf":
                return {
                    type: "Executable",
                    icon: "far fa-window-maximize",
                    extension: ext,
                };
            case ".jar":
            case ".class":
            case ".java":
                return { type: "Java", icon: "fab fa-java", extension: ext }; //Java
            case ".c":
            case ".cpp":
            case ".cs":
            case ".h":
            case ".m":
            case ".mm":
                return {
                    type: "C-language Family",
                    icon: "fab fa-cuttlefish",
                    extension: ext,
                }; // C-Languages
            case ".apk":
                return {
                    type: "Android-App",
                    icon: "fab fa-android",
                    extension: ext,
                }; //Android
            case ".ipa":
                return {
                    type: "Ios-App",
                    icon: "fab fa-app-store-ios",
                    extension: ext,
                }; //Ios App
            //fonts
            case ".fnt":
            case ".fon":
            case ".otf":
            case ".ttf":
                return { type: "Font", icon: "fas fa-font", extension: ext };
            //Images
            case ".ai":
            case ".bmp":
            case ".gif":
            case ".jpeg":
            case ".jpg":
            case ".png":
            case ".ps":
            case ".psd":
            case ".svg":
            case ".tif":
            case ".tiff":
                return {
                    type: "Image",
                    icon: "fas fa-file-image",
                    extension: ext,
                };
            //Icons
            case ".ico":
                return {
                    type: "Icon",
                    icon: "fas fa-file-image",
                    extension: ext,
                };
            //scripts and languages
            case ".asp":
            case ".aspx":
            case ".cer":
            case ".cfm":
            case ".cgi":
            case ".pl":
            case ".css":
            case ".htm":
            case ".html":
            case ".js":
            case ".jsp":
            case ".part":
            case ".php":
            case ".py":
            case ".rss":
            case ".xhtml":
            case ".sh":
            case ".swift":
            case ".vb":
                return {
                    type: "Scripts/Languages",
                    icon: "fas fa-file-code",
                    extension: ext,
                };
            //spreadsheet
            case ".ods":
            case ".xls":
            case ".xlsm":
            case ".xlsx":
                return {
                    type: "Spreadsheet",
                    icon: "fas fa-file-excel",
                    extension: ext,
                };
            //System
            case ".bak":
            case ".cab":
            case ".cfg":
            case ".cpl":
            case ".cur":
            case ".dll":
            case ".dmp":
            case ".drv":
            case ".ini":
            case ".lnk":
            case ".sys":
            case ".tmp":
                return { type: "System", icon: "fas fa-cogs", extension: ext };
            //videos
            case ".avi":
            case ".mpg":
            case ".mpe":
            case ".mpeg":
            case ".asf":
            case ".wmv":
            case ".mov":
            case ".qt":
            case ".rm":
            case ".mp4":
            case ".flv":
            case ".m4v":
            case ".webm":
            case ".ogv":
            case ".mkv":
                return {
                    type: "Video",
                    icon: "fas fa-file-video",
                    extension: ext,
                };
            //Word
            case ".doc":
            case ".docx":
                return {
                    type: "Word",
                    icon: "fas fa-file-word",
                    extension: ext,
                };
            case ".pdf":
                return { type: "Pdf", icon: "fas fa-file-pdf", extension: ext }; //PDF
            case ".rtf":
            case ".txt":
            case ".tex":
            case ".wpd":
            case ".odt":
                return {
                    type: "Text",
                    icon: "fas fa-file-alt",
                    extension: ext,
                }; //Text File
            //PowerPoint
            case ".key":
            case ".odp":
            case ".ppt":
            case ".pps":
            case ".pptx":
                return {
                    type: "PowerPoint",
                    icon: "fas fa-file-powerpoint",
                    extension: ext,
                };
        }
        return { type: "file", icon: "fas fa-file" };
    }

    static GetFolder(Path = "", callback) {
        fs.readdir(path.join(__dirname, FileManager.Path, Path))
            .then((res) => {
                let result = [];
                res.forEach((el) => {
                    result.push(FileManager.GetFileStats(Path, el));
                });
                Promise.all(result).then((values) => {
                    FileManager.GetFileStats(Path, "").then((res) => {
                        callback(200, { folder: res, files: values });
                    });
                });
            })
            .catch((err) => {
                callback(400, { Error: err });
            });
    }

    static GetFileStats(Path, file) {
        return fs
            .stat(path.join(__dirname, FileManager.Path, Path, file))
            .then((res) => {
                return {
                    Url: path.join("/files/", Path, file),
                    Name: file === "" ? "files" : file,
                    Type: res.isFile()
                        ? FileManager.GetFileType(file)
                        : res.isDirectory()
                        ? { type: "folder", icon: "fas fa-folder" }
                        : { Error: "this file isn't a file nor a directory" },
                    Size: res.size,
                    Modified: res.mtime,
                    Created: res.birthtime,
                };
            })
            .catch((reason) => {
                Console.error(reason, "Corrupted File");
                return {
                    Url: path.join(Path, file),
                    Name: file,
                    Type: {
                        type: "Corrupted",
                        icon: "fas fa-file-medical-alt",
                    },
                    Size: 0,
                };
            });
    }

    static GetFilesTree(Path = "", callback, FoldersOnly = true) {
        let result = {};
        fs.readdir(path.join(__dirname, FileManager.Path, Path), {
            withFileTypes: true,
        })
            .then((list) => {
                let pending = list.length;
                if (!pending) return callback(200, result);
                list.forEach((file) => {
                    if (file.isDirectory()) {
                        FileManager.GetFilesTree(
                            Path + "/" + file.name,
                            function (status, res) {
                                result[file.name] = res;
                                if (!--pending) callback(200, result);
                            },
                            FoldersOnly
                        );
                    } else if (file.isFile() && !FoldersOnly) {
                        result[file.name] = null;
                        if (!--pending) callback(200, result);
                    } else if (!--pending) callback(200, result);
                });
            })
            .catch((err) => {
                Console.error(err, "Requiring Files Tree");
                callback(500, { err });
            });
    }

    static CreateFolder(Path, FolderName, fullPath = false) {
        return fs
            .mkdir(
                fullPath
                    ? path.join(Path, FolderName)
                    : path.join(__dirname, FileManager.Path, Path, FolderName)
            )
            .then(() => {
                Console.log({
                    name: "Creating New Folder",
                    message: Path + " has been created",
                    code: "CMS_FILE_MANAGER",
                });
            });
    }

    static NewFolder(Path, FolderName, callback) {
        return FileManager.CreateFolder(Path, FolderName)
            .then(() => callback(201, "Folder Created successfully"))
            .catch((err) => {
                Console.error(err, "Creating New Folder");
                callback(500, "Couldn't Create Folder :" + err);
            });
    }

    static DeleteFiles(files, callback) {
        if (files instanceof Array) {
            let All = [];
            for (let i = 0; i < files.length; i++) {
                All.push(
                    FileManager.DeleteFile(files[i].Url, files[i].Type.type)
                );
            }
            Promise.all(All).then((values) => {
                let count = 0;
                values.forEach((el) => {
                    if (el instanceof Error) count++;
                });
                if (count > 0)
                    callback(
                        500,
                        count === values.length
                            ? "Couldn't Delete any file"
                            : "Couldn't Delete all the files"
                    );
                else callback(200, "All files has been deleted");
            });
        }
    }

    static DeleteFile(Path, type, fullPath = false) {
        let deleteFile;
        Path = fullPath
            ? Path
            : path.join(
                  __dirname,
                  FileManager.Path,
                  Path.replace(/^(\\?files)?/g, "")
              );
        if (type === "folder") deleteFile = fs.rmdir(Path, { recursive: true });
        else deleteFile = fs.unlink(Path);
        return deleteFile
            .then(() => {
                Console.log({
                    name: "Deleting File/Folder",
                    message: Path + " has been Deleted",
                    code: "CMS_FILE_MANAGER",
                });
                return {};
            })
            .catch((err) => {
                Console.error(err, "Deleting File/Folder");
                return err;
            });
    }

    static MoveFile(OldPath, NewPath, fullPathO = false, fullPathN = false) {
        return fs
            .rename(
                fullPathO
                    ? OldPath
                    : path.join(
                          __dirname,
                          FileManager.Path,
                          OldPath.replace(/^(\\?files)?/g, "")
                      ),
                fullPathN
                    ? NewPath
                    : path.join(__dirname, FileManager.Path, NewPath)
            )
            .then(() => {
                Console.log({
                    name: "Moving File/Folder",
                    message: OldPath + " has been Moved to " + NewPath,
                    code: "CMS_FILE_MANAGER",
                });
                return {};
            })
            .catch((err) => {
                Console.error(err, "Moving File/Folder");
                return err;
            });
    }

    static MoveFiles(NewPath, Files, callback) {
        let Promises = [];
        Files.forEach((file) => {
            Promises.push(
                FileManager.MoveFile(file.Url, NewPath + "/" + file.Name)
            );
        });
        Promise.all(Promises).then((values) => {
            let count = 0;
            values.forEach((el) => {
                if (el instanceof Error) count++;
            });
            if (count === values.length) {
                callback(500, "Couldn't Move any file");
            } else if (count > 0) {
                callback(500, "Couldn't Move all the files");
            } else {
                callback(200, "All files has been Moved");
            }
        });
    }

    static CopyFiles(NewPath, Files, callback) {
        let Promises = [];
        Files.forEach((file) => {
            Promises.push(
                FileManager.CopyFile(file.Url, NewPath + "/" + file.Name)
            );
        });
        Promise.all(Promises).then((values) => {
            let count = 0;
            values.forEach((el) => {
                if (el instanceof Error) count++;
            });
            if (count === values.length) {
                callback(500, "Couldn't Copy any file");
            } else if (count > 0) {
                callback(500, "Couldn't Copy all the files");
            } else {
                callback(200, "All files has been Copied");
            }
        });
    }

    static CopyFile(OldPath, NewPath) {
        return fs
            .copy(
                path.join(__dirname, FileManager.Path, OldPath),
                path.join(__dirname, FileManager.Path, NewPath),
                fs.constants.COPYFILE_FICLONE
            )
            .then(() => {
                Console.log({
                    name: "Copying File/Folder",
                    message: OldPath + " has been copied to " + NewPath,
                    code: "CMS_FILE_MANAGER",
                });
                return {};
            })
            .catch((err) => {
                Console.error(err, "Copying File/Folder");
                return err;
            });
    }

    static async Decompress(File) {
        File = path.join(
            __dirname,
            FileManager.Path,
            File.replace(/^(\\?files)?/g, "")
        );
        let Destination = path.join(
            path.dirname(File),
            path.basename(File, path.extname(File))
        );
        await fs.mkdir(Destination).catch((err) => {
            Console.error(err, "Folder already Exist");
            Destination += new Date().getTime();
            return fs.mkdir(Destination);
        });
        return decompress(File, Destination).then(() => {
            return Destination;
        });
    }

    static LoadJsonFile(filename, fullPath = false) {
        return fs
            .readFile(
                fullPath ? filename : path.join(__dirname, filename),
                "utf-8"
            )
            .then((file) => {
                return JSON.parse(file);
            });
    }

    static WriteJsonFile(filename, json, fullPath = false) {
        return fs.writeFile(
            fullPath ? filename : path.join(__dirname, filename),
            JSON.stringify(json),
            "utf-8"
        );
    }
};
