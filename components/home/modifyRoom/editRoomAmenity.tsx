import { useMutation } from '@apollo/client';
import styles from '../styles/style.module.scss';
import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useToast,
} from '@chakra-ui/react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useClassName from '@lib/useClassName';
import { getSSRRoomById, RoomData } from '@lib/apollo/home/room';
import { Amenity, updateRoomAmenity } from '@lib/apollo/home/room';
import listAmenityIcon from '@lib/amenities';
import EmptyData from '@components/emptydata';
import useResize from '@lib/use-resize';

interface RoomAmenityProps {
    closeForm: () => void;
    roomId: string;
    callback?: () => void;
    amenities?: Amenity[];
}

export const EditRoomAmenity = ({ closeForm, roomId, callback, amenities }: RoomAmenityProps) => {
    const toast = useToast();
    const [mobilemode] = useResize();
    const [listAmenity, setListAmenity] = useState<Amenity[]>(amenities ? amenities : []);
    const [updateRoom] = useMutation(updateRoomAmenity.command, {
        update(cache, { data: { updateRoom } }) {
            const data = cache.readQuery<{ getRoomById: RoomData }>({
                query: getSSRRoomById.command,
                variables: getSSRRoomById.variables(roomId),
            });
            const newData = data ? { ...data.getRoomById, ...updateRoom } : { ...updateRoom };
            cache.writeQuery({
                query: getSSRRoomById.command,
                variables: getSSRRoomById.variables(roomId),
                data: {
                    getRoomById: newData,
                },
            });
        },
        onCompleted: () => {
            toast({
                title: `Cập nhật phòng thành công`,
                position: 'bottom-left',
                status: 'success',
                isClosable: true,
            });
            callback && callback();
            // setUpLoading(false);
            closeForm();
            // console.log(client)
        },
    });
    const [key, setKey] = useState<number | null>(null);
    const [showIcon, setShowIcon] = useState(false);

    const [className] = useClassName(styles);

    const renderAmenities = useMemo(() => {
        return listAmenity.map((item, index) => {
            const val = listAmenityIcon[parseInt(item.title)];
            return (
                <div key={index} {...className('homeform-amenity__item')}>
                    <h1>{val.icon}</h1>
                    <p>{val.des}</p>
                    <Button
                        variant="link"
                        _focus={{
                            boxShadow: 'none',
                        }}
                        onClick={() => {
                            const list = listAmenity.filter((val) => val.title != item.title);
                            setListAmenity(list);
                        }}
                    >
                        <i className="fa-solid fa-trash-can"></i>
                    </Button>
                </div>
            );
        });
    }, [listAmenity]);

    /* useEffect(() => {
        scroll.disableScroll();

        return () => {
            scroll.enableScroll();
        };
    }, []); */

    const [upLoading, setUpLoading] = useState(false);
    const [dropUp, setDropUp] = useState(false);

    const submitForm = useCallback(() => {
        setUpLoading(true);
        updateRoom({
            variables: updateRoomAmenity.variables(listAmenity, roomId),
        }).catch(() => {
            toast({
                title: `Server timeout`,
                position: 'bottom-left',
                status: 'error',
                description: 'Có vấn đề với kết nối',
                isClosable: true,
            });
            setUpLoading(false);
        });
    }, [listAmenity]);

    useEffect(() => {
        const windowClick = (e: Event) => {};
        window.addEventListener('click', windowClick);
        return () => {
            window.removeEventListener('click', windowClick);
        };
    }, [showIcon]);

    const renderAvaiableAmenities = useMemo(() => {
        return listAmenityIcon.map((item, key) => {
            const val = listAmenity.findIndex((i) => i.title == key.toString());
            console.log(val);
            if (val != -1) {
                return;
            }
            return (
                <li
                    key={key}
                    onClick={(e) => {
                        setKey(key);
                        setShowIcon(false);
                    }}
                >
                    {item.icon} {item.des}
                </li>
            );
        });
    }, [listAmenity]);

    useEffect(() => {
        const resizeHandle = () => {
            const dropdown = document.getElementById('dropdown-dialog');
            if (dropdown) {
                const y = dropdown.getBoundingClientRect().y;
                if (!dropUp && y > 250) {
                    setDropUp(true);
                } else if (dropUp && y <= 250) {
                    setDropUp(false);
                }
            }
        };
        resizeHandle();
        window.addEventListener('resize', resizeHandle);

        return () => {
            window.removeEventListener('resize', resizeHandle);
        };
    }, [dropUp, listAmenity]);

    return (
        <>
            <Modal
                onClose={closeForm}
                isOpen={true}
                scrollBehavior="outside"
                {...(mobilemode ? { size: 'full' } : {})}
            >
                <ModalOverlay overflowY="scroll" />
                <ModalContent {...(mobilemode ? { borderRadius: 0 } : {})}>
                    <ModalHeader>Tiện ích</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <form
                            style={{
                                display: 'flex',
                                flexFlow: 'column',
                                gap: '10px',
                            }}
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (key != null) {
                                    const newData: Amenity = {
                                        title: key.toString(),
                                    };
                                    setListAmenity([...listAmenity, newData]);
                                    setKey(null);
                                }
                            }}
                        >
                            <div {...className('homeform__showamenity')}>{renderAmenities}</div>
                            <div {...className('homeform-amenity')}>
                                <div {...className('homeform-amenity__icon')}>
                                    <Button
                                        id="dropdown-dialog"
                                        borderWidth="3px"
                                        width="100%"
                                        gap="15px"
                                        _focus={{
                                            outline: 'none',
                                            borderColor: '#80befc',
                                        }}
                                        placeholder="icon"
                                        onClick={() => {
                                            setShowIcon((prev) => !prev);
                                        }}
                                    >
                                        {key != null ? (
                                            <>
                                                {listAmenityIcon[key].icon}{' '}
                                                {listAmenityIcon[key].des}
                                            </>
                                        ) : (
                                            'Tiện ích'
                                        )}
                                    </Button>
                                    <AnimatePresence>
                                        {showIcon && (
                                            <motion.ul
                                                initial={
                                                    dropUp
                                                        ? {
                                                              y: -50,
                                                              opacity: 0,
                                                              bottom: '100%',
                                                          }
                                                        : {
                                                              y: 50,
                                                              opacity: 0,
                                                              top: '100%',
                                                          }
                                                }
                                                animate={
                                                    dropUp
                                                        ? {
                                                              y: -5,
                                                              opacity: 1,
                                                              bottom: '100%',
                                                          }
                                                        : {
                                                              y: 5,
                                                              opacity: 1,
                                                              top: '100%',
                                                          }
                                                }
                                                exit={
                                                    dropUp
                                                        ? {
                                                              y: -50,
                                                              opacity: 0,
                                                              bottom: '100%',
                                                          }
                                                        : {
                                                              y: 50,
                                                              opacity: 0,
                                                              top: '100%',
                                                          }
                                                }
                                            >
                                                {renderAvaiableAmenities.length >
                                                listAmenity.length ? (
                                                    renderAvaiableAmenities
                                                ) : (
                                                    <EmptyData text="không còn tiện ích nào khả dụng" />
                                                )}
                                            </motion.ul>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                            <Button type="submit" isDisabled={key == null}>
                                Add
                            </Button>
                        </form>
                    </ModalBody>
                    <ModalFooter>
                        <div className="addhome-form__submit">
                            <Button
                                onClick={() => {
                                    closeForm();
                                    setUpLoading(false);
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={() => {
                                    submitForm();
                                }}
                                isLoading={upLoading}
                                type="button"
                                colorScheme="red"
                            >
                                Cập nhật
                            </Button>
                        </div>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};
