import { useMutation } from '@apollo/client';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    Input,
    useToast,
} from '@chakra-ui/react';
import { InputStyle } from '@chakra';
import { RoomData } from '@lib/interface';
import { deleteAllFile, getPathFileFromLink } from '@lib/upLoadAllFile';
import { useMemo, useRef, useState } from 'react';
import { removeVietnameseTones } from '@lib/removeVietnamese';
import { deleteRoomById } from '@lib/apollo/home/room';
import useResize from '@lib/use-resize';

interface Props {
    closeForm: () => void;
    callback?: () => any;
    roomData: RoomData;
}

export function DeleteRoom({ closeForm, roomData }: Props) {
    const [deleteRoom] = useMutation(deleteRoomById.command, {
        variables: deleteRoomById.variables(roomData._id),
    });
    const ref = useRef(null);
    const toast = useToast();
    const [mobilemode] = useResize();
    const [deleting, setDeleting] = useState(false);
    const [value, typing] = useState('');
    const trueValue = useRef('Toi chac chan');

    const isTrue = useMemo(() => {
        const val = removeVietnameseTones(value);
        console.log(val, trueValue.current);
        return val == trueValue.current;
    }, [value]);

    return (
        <>
            <AlertDialog
                isOpen={true}
                leastDestructiveRef={ref}
                {...(mobilemode
                    ? {
                          size: '2xl',
                      }
                    : {})}
                onClose={closeForm}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent
                        {...(mobilemode
                            ? {
                                  borderRadius: '0',
                              }
                            : {})}
                    >
                        <AlertDialogHeader fontSize="lg" paddingBottom="5px" fontWeight="bold">
                            X??a ph??ng
                        </AlertDialogHeader>

                        <AlertDialogBody display="flex" flexFlow="column" gap="10px">
                            <div>Nh???p "T??i ch???c ch???n" ????? x??a ph??ng n??y?</div>
                            <div>
                                <Input
                                    {...InputStyle}
                                    height="40px"
                                    value={value}
                                    onChange={(e) => typing(e.target.value)}
                                    placeholder="T??i ch???c ch???n?"
                                />
                            </div>
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button onClick={closeForm}>H???y</Button>
                            <Button
                                colorScheme="red"
                                isLoading={deleting}
                                isDisabled={!isTrue}
                                onClick={() => {
                                    setDeleting(true);
                                    const listPath = roomData.images.map((item) => {
                                        return getPathFileFromLink(item);
                                    });
                                    deleteAllFile(listPath)
                                        .then(() => {
                                            deleteRoom().then(() => {
                                                toast({
                                                    title: `X??a ph??ng th??nh c??ng`,
                                                    position: 'bottom-left',
                                                    status: 'success',
                                                    isClosable: true,
                                                });
                                                window.location.replace(
                                                    `/home/${roomData.home._id}`
                                                );
                                            });
                                        })
                                        .catch((e) => {
                                            console.log(e);
                                            toast({
                                                title: `Server timeout`,
                                                description: 'X??a ???nh th???t b???i',
                                                position: 'bottom-left',
                                                status: 'error',
                                                isClosable: true,
                                            });
                                        });
                                }}
                                ml={3}
                            >
                                ?????ng ??
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
}
