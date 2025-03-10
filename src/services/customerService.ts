import bcrypt from 'bcrypt';
import userRepository from '../repositories/userRepository';
import customerRepository from '../repositories/customerRepository';
import estimateRequestRepository from '../repositories/estimateRequestRepository';
import { $Enums } from '@prisma/client';
import { todayUTC } from '../utils/dateUtil';

const getCustomer = async (userId: number) => {
  const customerData = await customerRepository.findFirstData({
    where: { userId: userId },
    select: {
      id: true,
      userId: true,
      profileImage: true,
      serviceType: true,
      region: true,
      User: {
        select: {
          name: true,
        },
      },
    },
  });

  const today = todayUTC();

  const estimateReqConfirmed = await estimateRequestRepository.findFirstData({
    where: {
      customerId: customerData?.id,
      isConfirmed: false,
      isCancelled: false,
      MovingInfo: { movingDate: { gte: today } },
    },
  });
  console.log(estimateReqConfirmed);
  const isConfirmed = !estimateReqConfirmed;

  const list = {
    id: customerData?.id,
    userId: customerData?.userId,
    profileImg: customerData?.profileImage,
    serviceType: customerData?.serviceType,
    region: customerData?.region,
    customername: customerData?.User?.name,
    isConfirmed,
  };

  return list;
};

const createCustomer = async (userId: number) => {
  const data = {
    userId: userId,
    region: 'NULL' as $Enums.serviceRegion,
    serviceType: [],
  };

  const customerData = await customerRepository.createData({ data });

  return customerData;
};

const patchCustomerProfile = async (userId: number, data: any) => {
  const customerData = await customerRepository.findFirstData({
    where: { userId: userId },
  }); //
  if (!customerData) {
    throw new Error('프로필 생성하지 않음');
  }

  const patchData = {
    profileImage: data.profileImage,
    serviceType: data.serviceType,
    region: data.region,
  };
  const where = { id: customerData.id };
  return await customerRepository.updateData({ where, data: patchData });
};

const patchCustomerInfo = async (userId: number, data: any) => {
  const userData = await userRepository.findFirstData({
    where: { id: userId },
  });
  if (!userData) {
    return {
      status: 400,
      type: 'user',
      message: '유저 정보가 없습니다.',
    };
  }
  const isPasswordMatch = await bcrypt.compare(
    data.usedPassword,
    userData.password as string
  );
  if (!isPasswordMatch) {
    return {
      status: 400,
      type: 'password',
      message: '비밀번호가 일치하지 않습니다.',
    };
  }
  const newHashedPassword = await bcrypt.hash(data.newPassword, 10);
  const patchData = {
    name: data.name,
    phoneNumber: data.phoneNumber,
    password: newHashedPassword,
  };
  const where = { id: userData.id };
  await userRepository.updateData({ where, data: patchData });

  return {
    status: 200,
    type: 'success',
    message: '회원정보 수정 완료',
  };
};

export { patchCustomerProfile, patchCustomerInfo, createCustomer, getCustomer };
