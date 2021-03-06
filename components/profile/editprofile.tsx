import { useMutation } from '@apollo/client';
import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Text,
    Tooltip,
} from '@chakra-ui/react';
import { Variants } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { updateProfile, UpdateProfile, useSubmitProfile } from '@lib/apollo/profile';
import { User } from '@lib/withAuth';
import FormLocation from '@components/location';
import { getListExitPosition } from '@lib/getPosition';
import AvatarUpload from '@components/avatar/AvatarUpload';

const container: Variants = {
    show: {
        opacity: 1,
    },
    hidden: {
        opacity: 0,
    },
};

const formAnimate: Variants = {
    show: {
        opacity: 1,
        y: 0,
    },
    hidden: {
        opacity: 0,
        y: -100,
    },
};

interface RoomAmenityProps {
    closeForm: () => void;
    callback?: () => void;
    user: User;
}

export const EditProfile = ({ closeForm, callback, user }: RoomAmenityProps) => {
    const [updateUserProfile] = useMutation(updateProfile.command, {
        onCompleted: () => {
            callback && callback();
            closeForm();
        },
    });
    const [isOpen, setOpen] = useState(false);
    const { register, handleSubmit, watch, setValue } = useForm<UpdateProfile>();
    const provinceData = watch('province');
    const districtData = watch('district');
    const wardData = watch('ward');
    const [listLocation, setListLocation] = useState<[any[], any[], any[]]>([[], [], []]);

    const submitForm = useCallback(async (e: any) => {
        return updateUserProfile({
            variables: updateProfile.variables(e),
        });
    }, []);

    const {
        submitUpdateProfile,
        error: errorAction,
        setError,
        loading,
    } = useSubmitProfile(submitForm, user);

    useEffect(() => {
        if (errorAction.province) {
            setError({ ...errorAction, province: false });
        }
    }, [provinceData]);

    useEffect(() => {
        if (errorAction.district) {
            setError({ ...errorAction, district: false });
        }
    }, [districtData]);

    useEffect(() => {
        if (errorAction.ward) {
            setError({ ...errorAction, ward: false });
        }
    }, [wardData]);

    const isHaveLocation = useMemo(() => {
        if (user.province && user.district && user.ward) {
            return true;
        }
        return false;
    }, [user]);

    const updateAvatarLink = useCallback((link: string) => {
        setValue('avatar', link);
    }, []);

    useEffect(() => {
        if (isHaveLocation) {
            getListExitPosition(user.province, user.district).then((res) => {
                setListLocation(res);
                setOpen(true);
            });
        } else {
            setOpen(true);
        }
    }, [user]);

    return (
        <>
            <Modal onClose={closeForm} isOpen={isOpen} scrollBehavior="outside">
                <ModalOverlay overflowY="scroll" />
                <ModalContent minWidth="min(500px, 100%)">
                    <ModalHeader>Profile</ModalHeader>
                    <ModalCloseButton
                        _focus={{
                            boxShadow: 'none',
                        }}
                    />
                    <ModalBody paddingBottom="20px">
                        <form
                            style={{
                                display: 'flex',
                                flexFlow: 'column',
                                gap: '10px',
                            }}
                            onSubmit={handleSubmit(submitUpdateProfile)}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    marginBottom: '15px',
                                }}
                            >
                                <AvatarUpload
                                    name={user.fullname}
                                    src={user.avatar}
                                    updateData={updateAvatarLink}
                                />
                            </div>
                            <Input
                                height="50px"
                                borderWidth="3px"
                                defaultValue={user.fullname}
                                _focus={{
                                    outline: 'none',
                                    borderColor: '#80befc',
                                }}
                                borderColor={errorAction.fullname ? 'red' : 'inherit'}
                                {...register('fullname')}
                                onChange={(e) => {
                                    setError({ ...errorAction, fullname: false });
                                    register('fullname').onChange(e);
                                }}
                                placeholder="T??n"
                            />
                            <Tooltip
                                isDisabled={!errorAction.numberPhone}
                                label="S??? ??i???n tho???i kh??ng h???p l???"
                                bgColor="red"
                                hasArrow
                            >
                                <Input
                                    height="50px"
                                    borderWidth="3px"
                                    defaultValue={user.numberPhone}
                                    _focus={{
                                        outline: 'none',
                                        borderColor: '#80befc',
                                    }}
                                    borderColor={errorAction.numberPhone ? 'red' : 'inherit'}
                                    {...register('numberPhone')}
                                    onChange={(e) => {
                                        setError({ ...errorAction, numberPhone: false });
                                        register('numberPhone').onChange(e);
                                    }}
                                    placeholder="T??n"
                                    type="number"
                                />
                            </Tooltip>
                            <Text className="addhome-form__label">?????a ch??? tr???</Text>
                            <div className="addhome-form__location">
                                <FormLocation
                                    provinceField={register('province')}
                                    districtField={register('district')}
                                    wardField={register('ward')}
                                    errorEvent={errorAction}
                                    allProvince={true}
                                    {...(isHaveLocation
                                        ? {
                                              defaultValue: {
                                                  value: {
                                                      province: user.province,
                                                      district: user.district,
                                                      ward: user.ward,
                                                  },
                                                  list: listLocation,
                                              },
                                          }
                                        : {})}
                                />
                            </div>
                            <div className="addhome-form__submit">
                                <Button
                                    type="button"
                                    onClick={() => {
                                        closeForm();
                                    }}
                                >
                                    H???y
                                </Button>
                                <Button isLoading={loading} type="submit" colorScheme="red">
                                    C???p nh???t
                                </Button>
                            </div>
                        </form>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};
